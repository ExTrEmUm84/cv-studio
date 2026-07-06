import type { ContactKey, CV, Education, Experience } from "./cv-data";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { contactItems, lines, PALETTE, parseLanguage, sample, storageKey } from "./cv-data";
import { CVPdf } from "./pdf";
import "./styles.css";

const ICON_PROPS = {
	fill: "none",
	stroke: "currentColor",
	strokeWidth: 2,
	strokeLinecap: "round",
	strokeLinejoin: "round",
} as const;

function ContactIconHtml({ name, color }: { name: ContactKey; color?: string }) {
	return (
		<svg
			className="cv-contact-icon"
			viewBox="0 0 24 24"
			width="13"
			height="13"
			aria-hidden="true"
			style={color ? { color } : undefined}
		>
			{name === "email" && (
				<>
					<path d="M3 5.5h18v13H3z" {...ICON_PROPS} />
					<path d="M3 6.5l9 6.5 9-6.5" {...ICON_PROPS} />
				</>
			)}
			{name === "phone" && (
				<path
					d="M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.13 1 .35 1.9.66 2.8a2 2 0 0 1-.45 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.45c.9.3 1.85.53 2.8.66a2 2 0 0 1 1.7 2z"
					{...ICON_PROPS}
				/>
			)}
			{name === "city" && (
				<>
					<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" {...ICON_PROPS} />
					<circle cx="12" cy="10" r="2.6" {...ICON_PROPS} />
				</>
			)}
			{name === "nationality" && (
				<>
					<circle cx="12" cy="12" r="9" {...ICON_PROPS} />
					<path d="M3 12h18" {...ICON_PROPS} />
					<path d="M12 3c2.6 2.7 2.6 15.3 0 18c-2.6-2.7-2.6-15.3 0-18z" {...ICON_PROPS} />
				</>
			)}
			{name === "age" && (
				<>
					<path d="M5 6.5h14v13H5z" {...ICON_PROPS} />
					<path d="M5 10.5h14" {...ICON_PROPS} />
					<path d="M9 3.5v4M15 3.5v4" {...ICON_PROPS} />
				</>
			)}
		</svg>
	);
}

function DotsHtml({ count }: { count: number }) {
	return (
		<span className="cv-dots">
			{[1, 2, 3, 4, 5].map((i) => (
				<i key={i} className={i <= count ? "on" : ""} />
			))}
		</span>
	);
}

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

function SidebarInfo({ cv }: { cv: CV }) {
	return (
		<aside className="cv-preview-side">
			{cv.photo && <img className="cv-photo" src={cv.photo} alt="Portrait" />}
			<h2>Coordonnées</h2>
			<div className="cv-side-contact">
				{contactItems(cv).map((item) => (
					<div key={item.key} className="cv-contact-line">
						{cv.showIcons && <ContactIconHtml name={item.key} color={cv.iconColor} />}
						<span>{item.value}</span>
					</div>
				))}
			</div>
			<h2>Compétences</h2>
			<div className="cv-side-tags">
				{lines(cv.skills).map((skill) => (
					<span key={skill}>{skill}</span>
				))}
			</div>
			<h2>Langues</h2>
			<div className="cv-side-langs">
				{lines(cv.languages).map((line) => {
					const lang = parseLanguage(line);
					return (
						<p key={line}>
							<strong>{lang.name}</strong>
							{lang.level && <span>{lang.level}</span>}
							{lang.dots > 0 && <DotsHtml count={lang.dots} />}
						</p>
					);
				})}
			</div>
			<h2>Intérêts</h2>
			{lines(cv.interests).map((line) => (
				<p key={line}>• {line}</p>
			))}
		</aside>
	);
}

function Preview({ cv }: { cv: CV }) {
	return (
		<div className={`cv-paper cv-${cv.template}`} style={{ "--accent": cv.accent } as React.CSSProperties}>
			{cv.template === "sidebar" && <SidebarInfo cv={cv} />}
			<main className="cv-preview-main">
				<header className="cv-head">
					{cv.template !== "sidebar" && cv.photo && (
						<img className="cv-photo cv-photo-inline" src={cv.photo} alt="Portrait" />
					)}
					<div>
						<h1>{cv.name}</h1>
						<p className="cv-role">{cv.title}</p>
						{cv.template !== "sidebar" &&
							(cv.showIcons ? (
								<div className="cv-contact cv-contact-row">
									{contactItems(cv).map((item) => (
										<span key={item.key} className="cv-contact-chip">
											<ContactIconHtml name={item.key} color={cv.iconColor} />
											{item.value}
										</span>
									))}
								</div>
							) : (
								<p className="cv-contact">
									{contactItems(cv)
										.map((item) => item.value)
										.join("  ·  ")}
								</p>
							))}
					</div>
				</header>
				<section>
					<h2>Profil</h2>
					<p className="cv-profile">{cv.profile}</p>
				</section>
				<section>
					<h2>Expériences</h2>
					{cv.experiences.map((item, index) => (
						<div className="cv-item" key={index}>
							<h3>
								{item.role} — {item.company}
							</h3>
							<small>
								{item.date} · {item.place}
							</small>
							<p>{item.description}</p>
						</div>
					))}
				</section>
				{cv.template !== "sidebar" && (
					<section>
						<h2>Compétences</h2>
						<div className="cv-tags">
							{lines(cv.skills).map((skill) => (
								<span key={skill}>{skill}</span>
							))}
						</div>
					</section>
				)}
				<section>
					<h2>Formation</h2>
					{cv.education.map((item, index) => (
						<div className="cv-item" key={index}>
							<h3>{item.degree}</h3>
							<small>
								{item.school} · {item.date} · {item.place}
							</small>
						</div>
					))}
				</section>
				{cv.template !== "sidebar" && (
					<section>
						<h2>Langues</h2>
						<div className="cv-languages">
							{lines(cv.languages).map((line) => {
								const lang = parseLanguage(line);
								return (
									<div key={line}>
										<strong>{lang.name}</strong>
										<span className="cv-lang-right">
											{lang.level}
											{lang.dots > 0 && <DotsHtml count={lang.dots} />}
										</span>
									</div>
								);
							})}
						</div>
					</section>
				)}
				{cv.template !== "sidebar" && (
					<section>
						<h2>Intérêts</h2>
						<p>{lines(cv.interests).join(" · ")}</p>
					</section>
				)}
			</main>
		</div>
	);
}

// Blocks that must never be cut across a page boundary (mirrors how the PDF keeps entries/sections whole).
const PAGE_GUARD_SELECTOR =
	".cv-item, .cv-side-langs p, .cv-languages > div, .cv-preview-main h2, .cv-preview-side h2, .cv-profile, .cv-head, .cv-tags, .cv-side-tags, .cv-side-contact";

type Block = { top: number; bottom: number };

/** Compute the y-offset of each page start so that no guarded block straddles a page boundary. */
function computePageBreaks(paper: HTMLElement, pageHeight: number): number[] {
	const paperTop = paper.getBoundingClientRect().top;
	const total = paper.scrollHeight;
	const blocks: Block[] = Array.from(paper.querySelectorAll<HTMLElement>(PAGE_GUARD_SELECTOR))
		.map((el) => {
			const rect = el.getBoundingClientRect();
			return { top: rect.top - paperTop, bottom: rect.bottom - paperTop };
		})
		.filter((block) => block.bottom > block.top)
		.sort((a, b) => a.top - b.top);

	// Nudge a candidate break up until it no longer slices through any guarded block.
	const safeBreak = (start: number): number => {
		let y = start;
		for (let guard = 0; guard < 50; guard++) {
			let moved = false;
			for (const block of blocks) {
				if (block.top < y - 0.5 && y < block.bottom - 0.5) {
					y = block.top;
					moved = true;
				}
			}
			if (!moved) break;
		}
		return y;
	};

	const breaks = [0];
	let pageStart = 0;
	for (const block of blocks) {
		if (block.bottom <= pageStart + pageHeight + 0.5) continue; // still fits on the current page
		const candidate = safeBreak(block.top);
		if (candidate <= pageStart + 0.5) continue; // block starts on this page (or is taller than a page) — let it overflow
		breaks.push(candidate);
		pageStart = candidate;
	}
	// Safety net: if some oversized block leaves content past the last page, add plain breaks.
	while (pageStart + pageHeight < total - 1 && breaks.length < 50) {
		pageStart += pageHeight;
		breaks.push(pageStart);
	}
	return breaks;
}

/**
 * Renders the live preview split into A4 sheets, breaking pages the way the PDF
 * does — never slicing an entry or section in half — so the on-screen preview
 * matches the downloaded document.
 */
function PaginatedPreview({ cv }: { cv: CV }) {
	const paperRef = useRef<HTMLDivElement>(null);
	const sheetRef = useRef<HTMLDivElement>(null);
	const [breaks, setBreaks] = useState<number[]>([0]);
	useLayoutEffect(() => {
		const paper = paperRef.current;
		const sheet = sheetRef.current;
		if (!paper || !sheet) return;
		const update = () => {
			const next = computePageBreaks(paper, sheet.clientHeight || 1);
			setBreaks((prev) =>
				prev.length === next.length && prev.every((value, i) => Math.abs(value - next[i]) < 1) ? prev : next,
			);
		};
		update();
		const observer = new ResizeObserver(update);
		observer.observe(paper);
		window.addEventListener("resize", update);
		return () => {
			observer.disconnect();
			window.removeEventListener("resize", update);
		};
	}, []);

	return (
		<div className="cv-pages">
			{breaks.map((offset, index) => {
				// Clip each sheet to the content that belongs to it (up to the next break); the
				// rest of the A4 sheet stays blank, exactly like the PDF pushing an entry down.
				const contentHeight = index < breaks.length - 1 ? breaks[index + 1] - offset : undefined;
				return (
					<div className="cv-sheet" key={index} ref={index === 0 ? sheetRef : undefined}>
						<div
							className="cv-sheet-slide"
							style={{
								height: contentHeight !== undefined ? `${contentHeight}px` : undefined,
								transform: `translateY(-${offset}px)`,
							}}
						>
							<div ref={index === 0 ? paperRef : undefined}>
								<Preview cv={cv} />
							</div>
						</div>
						<span className="cv-sheet-num">
							{index + 1} / {breaks.length}
						</span>
					</div>
				);
			})}
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
				<PaginatedPreview cv={cv} />
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
