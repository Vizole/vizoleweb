import { mailOptions, transporter } from "./mailTransporter"
import { replaceMergeTags, stripHTMLTags } from "app/mail/sliceHtml"
import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

interface Header {
  name: string
  value: string
}

const secret = process.env.CLOUDFARE_TURNSTILE_SECRET_KEY

export async function POST(req: any) {
  const data = await req.json()
  const htmlFilePath = path.join(process.cwd(), "app/mail", "contactForm.html")
  let htmlContent: string
  try {
    htmlContent = fs.readFileSync(htmlFilePath, "utf8")
  } catch (err) {
    console.error("Error reading HTML file: ", err)
    return
  }

  htmlContent = replaceMergeTags(data, htmlContent)
  const plainTextContent = stripHTMLTags(htmlContent)

  try {
    let formData = new FormData()
    formData.append("secret", secret as string)
    formData.append("response", data.token as string)
    formData.append("remoteip", data.ip as string)

    const url = "https://challenges.cloudflare.com/turnstile/v0/siteverify"
    const result = await fetch(url, {
      method: "POST",
      body: formData,
    })

    const outcome = (await result.json()) as any

    if (outcome.success) {
      await transporter.sendMail({
        ...mailOptions,
        subject: `Contact Inquiry - VizoleLabs Web`,
        text: plainTextContent,
        html: htmlContent,
      })
      return NextResponse.json({ success: true })
    }
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: error.status })
  }
}
