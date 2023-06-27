import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs";
import * as z from 'zod'

const routeContextSchema = z.object({
  params: z.object({
    publicId: z.string()
  })
})

export async function DELETE(
  request: Request,
  context: z.infer<typeof routeContextSchema>
) {
  try {
    const { userId } = auth()

    if (!userId) {
      return new Response("Unauthorized", { status: 401 })
    }

    const { params } = routeContextSchema.parse(context)


    const count = await prisma.documents.count({
      where: {
        publicId: params.publicId,
        ownerId: userId
      }
    })

    if (count === 0) {
      return new Response("forbidden", { status: 403 })
    }

    await prisma.documents.delete({
      where: {
        publicId: params.publicId
      }
    });

    return new Response(null, { status: 204 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify(error.issues), { status: 422 })
    }
    return new Response(null, { status: 500 })
  }
}

const patchDocSchema = z.object({
  title: z.string().min(1).max(128),
  document: z.any()
})

export type PatchDocType = z.infer<typeof patchDocSchema>
export async function PATCH(request: Request, context: z.infer<typeof routeContextSchema>) {
  try {
    const { userId } = auth()

    if (!userId) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { params } = routeContextSchema.parse(context)

    const count = await prisma.documents.count({
      where: {
        publicId: params.publicId,
        ownerId: userId
      }
    })

    if (count === 0) {
      return new Response('forbidden', { status: 403 })
    }

    const json = await request.json()
    const body = patchDocSchema.parse(json)

    await prisma.documents.update({
      where: {
        publicId: params.publicId
      },
      data: {
        title: body.title,
        document: body.document
      }
    })
    return new Response(null, { status: 204 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify(error.issues), { status: 422 })
    }
    return new Response(null, { status: 500 })
  }
}
