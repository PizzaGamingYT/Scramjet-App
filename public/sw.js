importScripts("/scram/scramjet.all.js");

const { ScramjetServiceWorker } = $scramjetLoadWorker();
const scramjet = new ScramjetServiceWorker();

const injectCode = `
<script src="https://cdn.jsdelivr.net/npm/eruda"></script>
<script>
    eruda.init();
</script>
`;

async function handleRequest(event) {
    await scramjet.loadConfig();

    if (scramjet.route(event)) {
        const response = await scramjet.fetch(event);

        const contentType = response.headers.get("content-type") || "";

        if (contentType.includes("text/html")) {
            let html = await response.text();

            html = html.replace(
                /<\/head>/i,
                `${injectCode}</head>`
            );

            const headers = new Headers(response.headers);
            headers.delete("content-length");

            return new Response(html, {
                status: response.status,
                statusText: response.statusText,
                headers: headers
            });
        }

        return response;
    }

    return fetch(event.request);
}

self.addEventListener("fetch", (event) => {
    event.respondWith(handleRequest(event));
});
