import { NextResponse } from "next/server"
import { connectToDatabase } from "helpers/server-helper"

export const POST = async (req: Request) => {
  try {
    const { name, email, password } = (await req.json()) as { name: string; email: string; password: string }
    if (!name || !email || !password) return NextResponse.json({ message: "Missing required fields" }, { status: 422 })
    await connectToDatabase()
  } catch (error) {
  } finally {
  }
}
