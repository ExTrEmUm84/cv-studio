import type { PreviewPageSize } from "../features/resume/preview/preview.shared.utils";
import type { CV, Education, Experience } from "./cv-data";
import { PDFDownloadLink, pdf } from "@react-pdf/renderer";
import { useEffect, useMemo, useRef, useState } from "react";
import { PdfCanvasDocument, PdfCanvasPage } from "../features/resume/preview/pdf-canvas";
import { PALETTE, sample, storageKey } from "./cv-data";
import { CVPdf } from "./pdf";
import "./styles.css";

function EgyptFlag() {
	return (
		<svg className="cv-flag" viewBox="0 0 30 20" preserveAspectRatio="none" role="img" aria-label="Drapeau égyptien">
			<rect width="30" height="6.667" fill="#ce1126" />
			<rect y="6.667" width="30" height="6.666" fill="#fff" />
			<rect y="13.333" width="30" height="6.667" fill="#111" />
			<circle cx="15" cy="10" r="2.4" fill="#c8a02a" />
		</svg>
	);
}

function Field({
	label,
	value,
	onChange,
	area = false,
}: {
	label: string;
	value: string;
	onChange: (value: string) => void;
	area?: boolean;
}) {
	return (
		// biome-ignore lint/a11y/noLabelWithoutControl: the input/textarea control is nested inside this label
		<label className="cv-field">
			<span>{label}</span>
			{area ? (
				<textarea value={value} onChange={(event) => onChange(event.target.value)} />
			) : (
				<input value={value} onChange={(event) => onChange(event.target.value)} />
			)}
		</label>
	);
}

function ExperienceEditor({
	item,
	onChange,
	onRemove,
}: {
	item: Experience;
	onChange: (item: Experience) => void;
	onRemove: () => void;
}) {
	return (
		<div className="cv-mini-card">
			<div className="cv-two">
				<Field label="Poste" value={item.role} onChange={(role) => onChange({ ...item, role })} />
				<Field label="Entreprise" value={item.company} onChange={(company) => onChange({ ...item, company })} />
			</div>
			<div className="cv-two">
				<Field label="Date" value={item.date} onChange={(date) => onChange({ ...item, date })} />
				<Field label="Lieu" value={item.place} onChange={(place) => onChange({ ...item, place })} />
			</div>
			<Field
				label="Description"
				value={item.description}
				onChange={(description) => onChange({ ...item, description })}
				area
			/>
			<button type="button" className="cv-link-button" onClick={onRemove}>
				Supprimer
			</button>
		</div>
	);
}

function EducationEditor({
	item,
	onChange,
	onRemove,
}: {
	item: Education;
	onChange: (item: Education) => void;
	onRemove: () => void;
}) {
	return (
		<div className="cv-mini-card">
			<Field label="Diplôme" value={item.degree} onChange={(degree) => onChange({ ...item, degree })} />
			<div className="cv-two">
				<Field label="École" value={item.school} onChange={(school) => onChange({ ...item, school })} />
				<Field label="Date" value={item.date} onChange={(date) => onChange({ ...item, date })} />
			</div>
			<Field label="Lieu" value={item.place} onChange={(place) => onChange({ ...item, place })} />
			<button type="button" className="cv-link-button" onClick={onRemove}>
				Supprimer
			</button>
		</div>
	);
}

function Editor({ cv, setCv }: { cv: CV; setCv: (cv: CV) => void }) {
	const set = <K extends keyof CV>(key: K, value: CV[K]) => setCv({ ...cv, [key]: value });
	const onPhoto = (file?: File) => {
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () => set("photo", String(reader.result));
		reader.readAsDataURL(file);
	};

	return (
		<aside className="cv-editor">
			<div className="cv-logo">
				<div className="cv-logo-mark">
					<EgyptFlag />
				</div>
				<div>
					<strong>Nourhaine Studio</strong>
					<small>éditeur local</small>
				</div>
			</div>
			<section className="cv-panel">
				<h2>Design</h2>
				<label className="cv-field">
					<span>Modèle</span>
					<select value={cv.template} onChange={(event) => set("template", event.target.value as CV["template"])}>
						<option value="classic">Classique premium</option>
						<option value="sidebar">Colonne latérale moderne</option>
						<option value="minimal">Minimaliste</option>
					</select>
				</label>
				<label className="cv-field">
					<span>Couleur principale</span>
					<input type="color" value={cv.accent} onChange={(event) => set("accent", event.target.value)} />
				</label>
				<div className="cv-palette">
					{PALETTE.map((color) => (
						<button
							key={color}
							type="button"
							className={cv.accent === color ? "cv-swatch on" : "cv-swatch"}
							style={{ background: color }}
							onClick={() => set("accent", color)}
							aria-label={`Couleur ${color}`}
						/>
					))}
				</div>
				<label className="cv-check">
					<input type="checkbox" checked={cv.showIcons} onChange={(event) => set("showIcons", event.target.checked)} />
					<span>Icônes de contact (décoche pour une version simple)</span>
				</label>
				{cv.showIcons && (
					<label className="cv-field cv-icon-color">
						<span>Couleur des icônes</span>
						<input
							type="color"
							value={cv.iconColor || "#9fc3e8"}
							onChange={(event) => set("iconColor", event.target.value)}
						/>
					</label>
				)}
			</section>
			<section className="cv-panel">
				<h2>Photo</h2>
				{cv.photo && <img className="cv-editor-photo" src={cv.photo} alt="Portrait" />}
				<label className="cv-file-button">
					Ajouter / changer la photo
					<input
						type="file"
						accept="image/png,image/jpeg,image/webp"
						onChange={(event) => onPhoto(event.target.files?.[0])}
					/>
				</label>
				{cv.photo && (
					<button type="button" className="cv-link-button" onClick={() => set("photo", "")}>
						Retirer la photo
					</button>
				)}
			</section>
			<section className="cv-panel">
				<h2>Identité</h2>
				<Field label="Nom" value={cv.name} onChange={(value) => set("name", value)} />
				<Field label="Titre" value={cv.title} onChange={(value) => set("title", value)} />
				<Field label="Email" value={cv.email} onChange={(value) => set("email", value)} />
				<Field label="Téléphone" value={cv.phone} onChange={(value) => set("phone", value)} />
				<Field label="Ville" value={cv.city} onChange={(value) => set("city", value)} />
				<Field label="Nationalité" value={cv.nationality} onChange={(value) => set("nationality", value)} />
				<Field label="Âge" value={cv.age} onChange={(value) => set("age", value)} />
				<Field label="Profil" value={cv.profile} onChange={(value) => set("profile", value)} area />
			</section>
			<section className="cv-panel">
				<h2>Expériences</h2>
				{cv.experiences.map((item, index) => (
					<ExperienceEditor
						key={index}
						item={item}
						onChange={(next) =>
							set(
								"experiences",
								cv.experiences.map((exp, i) => (i === index ? next : exp)),
							)
						}
						onRemove={() =>
							set(
								"experiences",
								cv.experiences.filter((_, i) => i !== index),
							)
						}
					/>
				))}
				<button
					type="button"
					className="cv-add-button"
					onClick={() =>
						set("experiences", [...cv.experiences, { role: "", company: "", date: "", place: "", description: "" }])
					}
				>
					+ Ajouter une expérience
				</button>
			</section>
			<section className="cv-panel">
				<h2>Formation</h2>
				{cv.education.map((item, index) => (
					<EducationEditor
						key={index}
						item={item}
						onChange={(next) =>
							set(
								"education",
								cv.education.map((edu, i) => (i === index ? next : edu)),
							)
						}
						onRemove={() =>
							set(
								"education",
								cv.education.filter((_, i) => i !== index),
							)
						}
					/>
				))}
				<button
					type="button"
					className="cv-add-button"
					onClick={() => set("education", [...cv.education, { degree: "", school: "", date: "", place: "" }])}
				>
					+ Ajouter une formation
				</button>
			</section>
			<section className="cv-panel">
				<h2>Compétences & langues</h2>
				<Field label="Compétences — une par ligne" value={cv.skills} onChange={(value) => set("skills", value)} area />
				<Field
					label="Langues — Langue | niveau | note 1-5 (points, optionnel)"
					value={cv.languages}
					onChange={(value) => set("languages", value)}
					area
				/>
				<Field label="Intérêts" value={cv.interests} onChange={(value) => set("interests", value)} area />
			</section>
		</aside>
	);
}

type PreviewLayer = {
	id: number;
	file: Blob;
	numPages: number;
	pageSizes: Record<number, PreviewPageSize>;
	renderedPages: number[];
	phase: "active" | "staged";
};

// Regenerate the PDF only once the user pauses typing.
const PREVIEW_DEBOUNCE_MS = 150;

/** Keep only the visible (active) layers, then stack the freshly built one on top. */
const stackPreviewLayer = (layers: PreviewLayer[], next: PreviewLayer): PreviewLayer[] => {
	const active = layers.filter((layer) => layer.phase === "active");
	return active.length === 0 ? [next] : [...active, next];
};

const setLayerPageCount = (layers: PreviewLayer[], id: number, numPages: number): PreviewLayer[] =>
	layers.map((layer) => (layer.id === id ? { ...layer, numPages } : layer));

const setLayerPageSize = (
	layers: PreviewLayer[],
	id: number,
	pageNumber: number,
	pageSize: PreviewPageSize,
): PreviewLayer[] =>
	layers.map((layer) =>
		layer.id === id ? { ...layer, pageSizes: { ...layer.pageSizes, [pageNumber]: pageSize } } : layer,
	);

/**
 * Mark a staged page as painted; once every page of a staged layer has rendered,
 * promote it to active and drop the previous active layer — so the swap only
 * happens when the new PDF is fully ready (no blank flash mid-edit).
 */
const markLayerPageRendered = (layers: PreviewLayer[], id: number, pageNumber: number): PreviewLayer[] => {
	let promote = false;
	const next = layers.map((layer) => {
		if (layer.id !== id || layer.renderedPages.includes(pageNumber)) return layer;
		const renderedPages = [...layer.renderedPages, pageNumber];
		if (layer.phase === "staged" && layer.numPages > 0 && renderedPages.length >= layer.numPages) {
			promote = true;
			return { ...layer, renderedPages, phase: "active" as const };
		}
		return { ...layer, renderedPages };
	});
	return promote ? next.filter((layer) => layer.id === id || layer.phase !== "active") : next;
};

/**
 * On-screen preview that renders the ACTUAL exported PDF (via @react-pdf/renderer)
 * to canvas with pdf.js — so what you see is exactly the downloaded document, page
 * breaks and all. Reuses the builder's battle-tested PdfCanvasDocument/PdfCanvasPage.
 */
function PdfPreview({ cv }: { cv: CV }) {
	const [layers, setLayers] = useState<PreviewLayer[]>([]);
	const idRef = useRef(0);

	useEffect(() => {
		let cancelled = false;
		const delay = idRef.current === 0 ? 0 : PREVIEW_DEBOUNCE_MS;
		const timer = window.setTimeout(async () => {
			try {
				const file = await pdf(<CVPdf cv={cv} />).toBlob();
				if (cancelled) return;
				setLayers((current) => {
					const hasActive = current.some((layer) => layer.phase === "active");
					const next: PreviewLayer = {
						id: idRef.current++,
						file,
						numPages: 0,
						pageSizes: {},
						renderedPages: [],
						phase: hasActive ? "staged" : "active",
					};
					return stackPreviewLayer(current, next);
				});
			} catch (error) {
				if (!cancelled) console.error("Aperçu PDF impossible à générer", error);
			}
		}, delay);
		return () => {
			cancelled = true;
			window.clearTimeout(timer);
		};
	}, [cv]);

	return (
		<div className="cv-pdf-preview">
			{layers.length === 0 && <p className="cv-pdf-status">Génération du PDF…</p>}
			<div className="cv-pdf-stack">
				{layers.map((layer) => (
					<div key={layer.id} className="cv-pdf-layer" data-phase={layer.phase} aria-hidden={layer.phase !== "active"}>
						<PdfCanvasDocument
							file={layer.file}
							onLoadSuccess={(document) =>
								setLayers((current) => setLayerPageCount(current, layer.id, document.numPages))
							}
						>
							{(document) => (
								<div className="cv-pdf-pages">
									{Array.from({ length: layer.numPages }, (_, index) => {
										const pageNumber = index + 1;
										return (
											<div className="cv-pdf-page" key={pageNumber}>
												<PdfCanvasPage
													document={document}
													pageNumber={pageNumber}
													pageScale={1}
													totalPages={layer.numPages}
													pageSize={layer.pageSizes[pageNumber]}
													className="cv-pdf-canvas"
													showPageNumbers={false}
													onLoadSuccess={(_, pageSize) =>
														setLayers((current) => setLayerPageSize(current, layer.id, pageNumber, pageSize))
													}
													onRenderSuccess={() => {
														if (layer.phase !== "staged") return;
														setLayers((current) => markLayerPageRendered(current, layer.id, pageNumber));
													}}
												/>
												<span className="cv-sheet-num">
													{pageNumber} / {layer.numPages}
												</span>
											</div>
										);
									})}
								</div>
							)}
						</PdfCanvasDocument>
					</div>
				))}
			</div>
		</div>
	);
}

function CVStudioMain() {
	const [cv, setCv] = useState<CV>(() => {
		try {
			const stored = localStorage.getItem(storageKey);
			return stored ? { ...sample, ...JSON.parse(stored) } : sample;
		} catch {
			return sample;
		}
	});
	useEffect(() => {
		localStorage.setItem(storageKey, JSON.stringify(cv));
	}, [cv]);
	const baseName = useMemo(() => (cv.name || "CV").replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, ""), [cv.name]);
	const fileName = `${baseName}.pdf`;
	const exportData = () => {
		const blob = new Blob([JSON.stringify(cv, null, 2)], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `${baseName}.json`;
		link.click();
		URL.revokeObjectURL(url);
	};
	const importData = (file?: File) => {
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () => {
			try {
				setCv({ ...sample, ...JSON.parse(String(reader.result)) });
			} catch {
				window.alert("Fichier invalide : ce n'est pas un export CV Studio valide.");
			}
		};
		reader.readAsText(file);
	};
	return (
		<div className="cv-studio-app">
			<Editor cv={cv} setCv={setCv} />
			<section className="cv-stage">
				<div className="cv-toolbar">
					<div>
						<strong>Aperçu direct</strong>
						<span>Les données restent dans ton navigateur.</span>
					</div>
					<div className="cv-toolbar-actions">
						<button type="button" onClick={() => setCv(sample)}>
							Réinitialiser
						</button>
						<button type="button" onClick={exportData}>
							Exporter
						</button>
						<label className="cv-import-button">
							Importer
							<input
								type="file"
								accept="application/json"
								hidden
								onChange={(event) => {
									importData(event.target.files?.[0]);
									event.target.value = "";
								}}
							/>
						</label>
						<PDFDownloadLink className="cv-pdf-button" document={<CVPdf cv={cv} />} fileName={fileName}>
							Télécharger PDF
						</PDFDownloadLink>
					</div>
				</div>
				<PdfPreview cv={cv} />
			</section>
		</div>
	);
}

/**
 * Light client-side password gate. NOTE: this is a static site, so the password
 * lives in the bundle and can be bypassed by anyone technical — it only keeps
 * casual visitors out and is NOT real security.
 */
function PasswordGate({ children }: { children: React.ReactNode }) {
	const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem("cv-studio-unlocked") === "1");
	const [value, setValue] = useState("");
	const [error, setError] = useState(false);
	if (unlocked) return <>{children}</>;
	const submit = (event: React.FormEvent) => {
		event.preventDefault();
		if (value.trim().toLowerCase() === atob("bm91cmhhaW5l")) {
			sessionStorage.setItem("cv-studio-unlocked", "1");
			setUnlocked(true);
		} else {
			setError(true);
		}
	};
	return (
		<div className="cv-gate">
			<form className="cv-gate-card" onSubmit={submit}>
				<div className="cv-gate-mark">
					<EgyptFlag />
				</div>
				<p>Espace protégé — entre le mot de passe pour continuer.</p>
				<input
					type="password"
					value={value}
					placeholder="Mot de passe"
					onChange={(event) => {
						setValue(event.target.value);
						setError(false);
					}}
				/>
				{error && <span className="cv-gate-error">Mot de passe incorrect.</span>}
				<button type="submit">Déverrouiller</button>
			</form>
		</div>
	);
}

export function CVStudioApp() {
	return (
		<PasswordGate>
			<CVStudioMain />
		</PasswordGate>
	);
}
