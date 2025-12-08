// File: app/routes/app.upload-image.jsx
import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    
    if (!file || !(file instanceof File)) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");
    const mimeType = file.type;

    // Upload to Shopify Files API
    const response = await admin.graphql(
      `#graphql
        mutation fileCreate($files: [FileCreateInput!]!) {
          fileCreate(files: $files) {
            files {
              ... on GenericFile {
                id
                url
                alt
              }
              ... on MediaImage {
                id
                image {
                  url
                }
                alt
              }
            }
            userErrors {
              field
              message
            }
          }
        }`,
      {
        variables: {
          files: [
            {
              alt: file.name,
              contentType: "FILE",
              originalSource: `data:${mimeType};base64,${base64}`,
            },
          ],
        },
      }
    );

    const responseJson = await response.json();
    
    if (responseJson.data?.fileCreate?.userErrors?.length > 0) {
      return Response.json(
        { error: responseJson.data.fileCreate.userErrors[0].message },
        { status: 400 }
      );
    }

    const uploadedFile = responseJson.data?.fileCreate?.files?.[0];
    const imageUrl = uploadedFile?.url || uploadedFile?.image?.url;

    return Response.json({ 
      success: true, 
      url: imageUrl,
      fileId: uploadedFile?.id,
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    return Response.json({ error: "Failed to upload image" }, { status: 500 });
  }
};

