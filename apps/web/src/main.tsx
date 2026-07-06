import ReactDOM from "react-dom/client";
import "./index.css";

const rootElement = document.getElementById("app");
if (!rootElement) throw new Error("Root element not found");

if (!rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);

	if (import.meta.env.VITE_CV_STUDIO_STATIC === "true") {
		const { CVStudioApp } = await import("./cv-studio/app");
		root.render(<CVStudioApp />);
	} else {
		const [{ RouterProvider }, { getRouter }] = await Promise.all([
			import("@tanstack/react-router"),
			import("./router"),
		]);
		const router = await getRouter();
		root.render(<RouterProvider router={router} />);
	}
}
