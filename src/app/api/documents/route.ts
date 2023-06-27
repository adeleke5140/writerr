import { prisma } from "@/lib/prisma";
import * as z from 'zod'
import { auth } from "@clerk/nextjs";

const createDocSchema = z.object({
  publicId: z.string(),
  title: z.string()
})

export type CreateDocType = z.infer<typeof createDocSchema>

export async function POST(request: Request) {
  try {
    const { userId } = auth()

    if (!userId) {
      return new Response('Unauthorized', { status: 401 })
    }
    const json = await request.json()
    const body = createDocSchema.parse(json)


    const document = await prisma.documents.create({
      data: {
        publicId: body.publicId,
        title: body.title,
        ownerId: userId
      }
    })
    return new Response(JSON.stringify(document), { status: 200 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify(error.issues), { status: 422 })
    }

    return new Response(null, { status: 500 })
  }
}
