importScripts("/scram/scramjet.all.js");

const { ScramjetServiceWorker } = $scramjetLoadWorker();
const scramjet = new ScramjetServiceWorker();

// The script snippet to be injected directly inside the target iframe's context
const injectCode = `
	<script src="https://cdn.jsdelivr.net/npm/eruda"></script>
	<script>eruda.init();</script>
`;

async function handleRequest(event) {
	await scramjet.loadConfig();
	
	if (scramjet.route(event)) {
		const response = await scramjet.fetch(event);
		const contentType = response.headers.get("content-type") || "";

		// Only modify requests that return HTML web documents
		if (contentType.includes("text/html")) {
			let htmlText = await response.text();
			
			// Dynamically inject the Eruda devtools right before the closing head tag
			htmlText = htmlText.replace("</head>", `${injectCode}</head>`);
			
			return new Response(htmlText, {
				headers: response.headers
			});
		}
		
		return response;
	}
	
	return fetch(event.request);
}

self.addEventListener("fetch", (event) => {
	event.respondWith(handleRequest(event));
});
