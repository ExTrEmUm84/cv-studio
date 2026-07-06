import type { CV, Education, Experience } from "./cv-data";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { useEffect, useMemo, useState } from "react";
import { contactValues, lines, parseLanguage, sample, storageKey } from "./cv-data";
import { CVPdf } from "./pdf";
import "./styles.css";

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
				<div className="cv-logo-mark">CV</div>
				<div>
					<strong>CV Studio</strong>
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
					label="Langues — format : Langue | niveau"
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
			<p>
				{contactValues(cv).map((value, index) => (
					<span key={value}>
						{index > 0 && <br />}
						{value}
					</span>
				))}
			</p>
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
							<span>{lang.level}</span>
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
						{cv.template !== "sidebar" && <p className="cv-contact">{contactValues(cv).join(" · ")}</p>}
					</div>
				</header>
				<section>
					<h2>Profil</h2>
					<p>{cv.profile}</p>
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
										<span>{lang.level}</span>
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

export function CVStudioApp() {
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
	const fileName = useMemo(
		() => `${(cv.name || "CV").replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, "")}.pdf`,
		[cv.name],
	);
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
						<PDFDownloadLink className="cv-pdf-button" document={<CVPdf cv={cv} />} fileName={fileName}>
							Télécharger PDF
						</PDFDownloadLink>
					</div>
				</div>
				<Preview cv={cv} />
			</section>
		</div>
	);
}
