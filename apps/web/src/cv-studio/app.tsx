import { Document, Image, Page, PDFDownloadLink, StyleSheet, Text, View } from "@react-pdf/renderer";
import { useEffect, useMemo, useState } from "react";
import "./styles.css";

type Experience = { role: string; company: string; date: string; place: string; description: string };
type Education = { degree: string; school: string; date: string; place: string };
type CV = {
	name: string;
	title: string;
	email: string;
	phone: string;
	city: string;
	nationality: string;
	photo: string;
	profile: string;
	skills: string;
	languages: string;
	interests: string;
	experiences: Experience[];
	education: Education[];
	accent: string;
	template: "classic" | "sidebar" | "minimal";
};

const storageKey = "cv-studio-standalone-v2";

const sample: CV = {
	name: "Prénom NOM",
	title: "Commerciale B2B",
	email: "email@example.com",
	phone: "+33 0 00 00 00 00",
	city: "Île-de-France",
	nationality: "Française",
	photo: "",
	profile:
		"Commerciale orientée développement et fidélisation, avec une expérience en vente B2B, gestion de comptes clients, appels d'offres et outils CRM. Organisée, autonome et dotée d'un excellent relationnel.",
	skills: "Prospection multicanale\nNégociation commerciale\nGestion du cycle de vente\nFidélisation client\nRéponse aux appels d'offres\nCRM, Excel, Office",
	languages: "Français | langue maternelle\nAnglais | courant\nAllemand | notions professionnelles",
	interests: "Théâtre\nSport\nEngagement associatif",
	experiences: [
		{ role: "Commerciale", company: "Entreprise A", date: "2024 – 2025", place: "Paris", description: "Prospection client, fidélisation, propositions commerciales, négociation, suivi des contrats et gestion CRM." },
		{ role: "Assistante commerciale", company: "Entreprise B", date: "2019 – 2022", place: "Nanterre", description: "Renouvellement de contrats, ventes additionnelles, gestion de base de données, relances et coordination administrative." },
	],
	education: [
		{ degree: "Master Négociation Commerciale Internationale", school: "Université", date: "2014", place: "Paris" },
		{ degree: "BTS Commerce International", school: "Lycée", date: "2011", place: "Île-de-France" },
	],
	accent: "#123047",
	template: "sidebar",
};

const lines = (value: string) => value.split("\n").map((item) => item.trim()).filter(Boolean);
const parseLanguage = (line: string) => {
	const [name, ...rest] = line.split("|").map((item) => item.trim());
	return { name, level: rest.join(" ") };
};

function Field({ label, value, onChange, area = false }: { label: string; value: string; onChange: (value: string) => void; area?: boolean }) {
	return <label className="cv-field"><span>{label}</span>{area ? <textarea value={value} onChange={(event) => onChange(event.target.value)} /> : <input value={value} onChange={(event) => onChange(event.target.value)} />}</label>;
}

function ExperienceEditor({ item, onChange, onRemove }: { item: Experience; onChange: (item: Experience) => void; onRemove: () => void }) {
	return <div className="cv-mini-card"><div className="cv-two"><Field label="Poste" value={item.role} onChange={(role) => onChange({ ...item, role })} /><Field label="Entreprise" value={item.company} onChange={(company) => onChange({ ...item, company })} /></div><div className="cv-two"><Field label="Date" value={item.date} onChange={(date) => onChange({ ...item, date })} /><Field label="Lieu" value={item.place} onChange={(place) => onChange({ ...item, place })} /></div><Field label="Description" value={item.description} onChange={(description) => onChange({ ...item, description })} area /><button className="cv-link-button" onClick={onRemove}>Supprimer</button></div>;
}

function EducationEditor({ item, onChange, onRemove }: { item: Education; onChange: (item: Education) => void; onRemove: () => void }) {
	return <div className="cv-mini-card"><Field label="Diplôme" value={item.degree} onChange={(degree) => onChange({ ...item, degree })} /><div className="cv-two"><Field label="École" value={item.school} onChange={(school) => onChange({ ...item, school })} /><Field label="Date" value={item.date} onChange={(date) => onChange({ ...item, date })} /></div><Field label="Lieu" value={item.place} onChange={(place) => onChange({ ...item, place })} /><button className="cv-link-button" onClick={onRemove}>Supprimer</button></div>;
}

function Editor({ cv, setCv }: { cv: CV; setCv: (cv: CV) => void }) {
	const set = <K extends keyof CV>(key: K, value: CV[K]) => setCv({ ...cv, [key]: value });
	const onPhoto = (file?: File) => {
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () => set("photo", String(reader.result));
		reader.readAsDataURL(file);
	};

	return <aside className="cv-editor"><div className="cv-logo"><div className="cv-logo-mark">CV</div><div><strong>CV Studio</strong><small>éditeur local</small></div></div><section className="cv-panel"><h2>Design</h2><label className="cv-field"><span>Modèle</span><select value={cv.template} onChange={(event) => set("template", event.target.value as CV["template"])}><option value="classic">Classique premium</option><option value="sidebar">Colonne latérale moderne</option><option value="minimal">Minimaliste</option></select></label><label className="cv-field"><span>Couleur principale</span><input type="color" value={cv.accent} onChange={(event) => set("accent", event.target.value)} /></label></section><section className="cv-panel"><h2>Photo</h2>{cv.photo && <img className="cv-editor-photo" src={cv.photo} alt="Photo candidat" />}<label className="cv-file-button">Ajouter / changer la photo<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => onPhoto(event.target.files?.[0])} /></label>{cv.photo && <button className="cv-link-button" onClick={() => set("photo", "")}>Retirer la photo</button>}</section><section className="cv-panel"><h2>Identité</h2><Field label="Nom" value={cv.name} onChange={(value) => set("name", value)} /><Field label="Titre" value={cv.title} onChange={(value) => set("title", value)} /><Field label="Email" value={cv.email} onChange={(value) => set("email", value)} /><Field label="Téléphone" value={cv.phone} onChange={(value) => set("phone", value)} /><Field label="Ville" value={cv.city} onChange={(value) => set("city", value)} /><Field label="Nationalité" value={cv.nationality} onChange={(value) => set("nationality", value)} /><Field label="Profil" value={cv.profile} onChange={(value) => set("profile", value)} area /></section><section className="cv-panel"><h2>Expériences</h2>{cv.experiences.map((item, index) => <ExperienceEditor key={index} item={item} onChange={(next) => set("experiences", cv.experiences.map((exp, i) => (i === index ? next : exp)))} onRemove={() => set("experiences", cv.experiences.filter((_, i) => i !== index))} />)}<button className="cv-add-button" onClick={() => set("experiences", [...cv.experiences, { role: "", company: "", date: "", place: "", description: "" }])}>+ Ajouter une expérience</button></section><section className="cv-panel"><h2>Formation</h2>{cv.education.map((item, index) => <EducationEditor key={index} item={item} onChange={(next) => set("education", cv.education.map((edu, i) => (i === index ? next : edu)))} onRemove={() => set("education", cv.education.filter((_, i) => i !== index))} />)}<button className="cv-add-button" onClick={() => set("education", [...cv.education, { degree: "", school: "", date: "", place: "" }])}>+ Ajouter une formation</button></section><section className="cv-panel"><h2>Compétences & langues</h2><Field label="Compétences — une par ligne" value={cv.skills} onChange={(value) => set("skills", value)} area /><Field label="Langues — format : Langue | niveau" value={cv.languages} onChange={(value) => set("languages", value)} area /><Field label="Intérêts" value={cv.interests} onChange={(value) => set("interests", value)} area /></section></aside>;
}

function SidebarInfo({ cv }: { cv: CV }) {
	return <aside className="cv-preview-side">{cv.photo && <img className="cv-photo" src={cv.photo} alt="Photo candidat" />}<h2>Coordonnées</h2><p>{cv.email}<br />{cv.phone}<br />{cv.city}<br />{cv.nationality}</p><h2>Compétences</h2><div className="cv-side-tags">{lines(cv.skills).map((skill) => <span key={skill}>{skill}</span>)}</div><h2>Langues</h2><div className="cv-side-langs">{lines(cv.languages).map((line) => { const lang = parseLanguage(line); return <p key={line}><strong>{lang.name}</strong><span>{lang.level}</span></p>; })}</div><h2>Intérêts</h2>{lines(cv.interests).map((line) => <p key={line}>• {line}</p>)}</aside>;
}

function Preview({ cv }: { cv: CV }) {
	return <div className={`cv-paper cv-${cv.template}`} style={{ "--accent": cv.accent } as React.CSSProperties}>{cv.template === "sidebar" && <SidebarInfo cv={cv} />}<main className="cv-preview-main"><header className="cv-head">{cv.template !== "sidebar" && cv.photo && <img className="cv-photo cv-photo-inline" src={cv.photo} alt="Photo candidat" />}<div><h1>{cv.name}</h1><p className="cv-role">{cv.title}</p>{cv.template !== "sidebar" && <p className="cv-contact">{cv.email} · {cv.phone} · {cv.city} · {cv.nationality}</p>}</div></header><section><h2>Profil</h2><p>{cv.profile}</p></section><section><h2>Expériences</h2>{cv.experiences.map((item, index) => <div className="cv-item" key={index}><h3>{item.role} — {item.company}</h3><small>{item.date} · {item.place}</small><p>{item.description}</p></div>)}</section>{cv.template !== "sidebar" && <section><h2>Compétences</h2><div className="cv-tags">{lines(cv.skills).map((skill) => <span key={skill}>{skill}</span>)}</div></section>}<section><h2>Formation</h2>{cv.education.map((item, index) => <div className="cv-item" key={index}><h3>{item.degree}</h3><small>{item.school} · {item.date} · {item.place}</small></div>)}</section>{cv.template !== "sidebar" && <section><h2>Langues</h2><div className="cv-languages">{lines(cv.languages).map((line) => { const lang = parseLanguage(line); return <div key={line}><strong>{lang.name}</strong><span>{lang.level}</span></div>; })}</div></section>}{cv.template !== "sidebar" && <section><h2>Intérêts</h2><p>{lines(cv.interests).join(" · ")}</p></section>}</main></div>;
}

const basePdfStyles = StyleSheet.create({
	page: { padding: 36, fontFamily: "Helvetica", color: "#17202a", fontSize: 10.5, lineHeight: 1.4 },
	row: { flexDirection: "row", alignItems: "center", gap: 18, marginBottom: 16 },
	photo: { width: 86, height: 86, borderRadius: 43, objectFit: "cover" },
	h1: { fontSize: 30, marginBottom: 5, fontWeight: 700 },
	role: { fontSize: 14, marginBottom: 6, fontWeight: 700 },
	contact: { color: "#667085", marginBottom: 18 },
	sectionTitle: { fontSize: 9, textTransform: "uppercase", letterSpacing: 1.5, marginTop: 17, marginBottom: 9, paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },
	item: { marginBottom: 11 }, itemTitle: { fontSize: 11.5, fontWeight: 700, marginBottom: 2 }, muted: { color: "#667085", marginBottom: 3 },
	tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 4 }, tag: { backgroundColor: "#eef2f6", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4, marginBottom: 4 },
	lang: { flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: "#eef2f6", paddingBottom: 4, marginBottom: 4 },
});

const sidebarPdfStyles = StyleSheet.create({
	page: { flexDirection: "row", fontFamily: "Helvetica", color: "#17202a", fontSize: 10.5, lineHeight: 1.4 },
	side: { width: "34%", paddingTop: 36, paddingHorizontal: 22, color: "white" },
	main: { width: "66%", paddingTop: 42, paddingHorizontal: 34, paddingBottom: 36 },
	photo: { width: 108, height: 108, borderRadius: 54, objectFit: "cover", marginBottom: 26, alignSelf: "center" },
	sideTitle: { color: "white", fontSize: 9, textTransform: "uppercase", letterSpacing: 1.6, marginTop: 24, marginBottom: 10, paddingBottom: 6, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,.35)" },
	sideText: { color: "rgba(255,255,255,.85)", marginBottom: 6 },
	sideTag: { color: "white", backgroundColor: "rgba(255,255,255,.14)", borderRadius: 10, paddingHorizontal: 7, paddingVertical: 4, marginRight: 4, marginBottom: 4, fontSize: 9 },
	h1: { fontSize: 30, marginBottom: 6, fontWeight: 700 },
	role: { fontSize: 14, marginBottom: 20, fontWeight: 700 },
	sectionTitle: { fontSize: 9, textTransform: "uppercase", letterSpacing: 1.6, marginTop: 18, marginBottom: 9, paddingBottom: 5, borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },
	item: { marginBottom: 12 },
	itemTitle: { fontSize: 11.5, fontWeight: 700, marginBottom: 2 },
	muted: { color: "#667085", marginBottom: 4 },
});

function ClassicPdf({ cv }: { cv: CV }) {
	return <Document title={cv.name || "CV"}><Page size="A4" style={basePdfStyles.page}><View style={basePdfStyles.row}>{cv.photo && <Image src={cv.photo} style={basePdfStyles.photo} />}<View><Text style={[basePdfStyles.h1, { color: cv.accent }]}>{cv.name}</Text><Text style={basePdfStyles.role}>{cv.title}</Text><Text style={basePdfStyles.contact}>{cv.email} · {cv.phone} · {cv.city} · {cv.nationality}</Text></View></View><Text style={[basePdfStyles.sectionTitle, { color: cv.accent }]}>Profil</Text><Text>{cv.profile}</Text><Text style={[basePdfStyles.sectionTitle, { color: cv.accent }]}>Expériences</Text>{cv.experiences.map((item, index) => <View key={index} style={basePdfStyles.item}><Text style={basePdfStyles.itemTitle}>{item.role} — {item.company}</Text><Text style={basePdfStyles.muted}>{item.date} · {item.place}</Text><Text>{item.description}</Text></View>)}<Text style={[basePdfStyles.sectionTitle, { color: cv.accent }]}>Compétences</Text><View style={basePdfStyles.tagRow}>{lines(cv.skills).map((skill) => <Text key={skill} style={basePdfStyles.tag}>{skill}</Text>)}</View><Text style={[basePdfStyles.sectionTitle, { color: cv.accent }]}>Formation</Text>{cv.education.map((item, index) => <View key={index} style={basePdfStyles.item}><Text style={basePdfStyles.itemTitle}>{item.degree}</Text><Text style={basePdfStyles.muted}>{item.school} · {item.date} · {item.place}</Text></View>)}<Text style={[basePdfStyles.sectionTitle, { color: cv.accent }]}>Langues</Text>{lines(cv.languages).map((line) => { const lang = parseLanguage(line); return <View key={line} style={basePdfStyles.lang}><Text style={basePdfStyles.itemTitle}>{lang.name}</Text><Text style={basePdfStyles.muted}>{lang.level}</Text></View>; })}</Page></Document>;
}

function SidebarPdf({ cv }: { cv: CV }) {
	return <Document title={cv.name || "CV"}><Page size="A4" style={sidebarPdfStyles.page}><View style={[sidebarPdfStyles.side, { backgroundColor: cv.accent }]}>{cv.photo && <Image src={cv.photo} style={sidebarPdfStyles.photo} />}<Text style={sidebarPdfStyles.sideTitle}>Coordonnées</Text><Text style={sidebarPdfStyles.sideText}>{cv.email}</Text><Text style={sidebarPdfStyles.sideText}>{cv.phone}</Text><Text style={sidebarPdfStyles.sideText}>{cv.city}</Text><Text style={sidebarPdfStyles.sideText}>{cv.nationality}</Text><Text style={sidebarPdfStyles.sideTitle}>Compétences</Text><View style={basePdfStyles.tagRow}>{lines(cv.skills).map((skill) => <Text key={skill} style={sidebarPdfStyles.sideTag}>{skill}</Text>)}</View><Text style={sidebarPdfStyles.sideTitle}>Langues</Text>{lines(cv.languages).map((line) => { const lang = parseLanguage(line); return <View key={line} style={{ marginBottom: 8 }}><Text style={{ color: "white", fontWeight: 700 }}>{lang.name}</Text><Text style={sidebarPdfStyles.sideText}>{lang.level}</Text></View>; })}<Text style={sidebarPdfStyles.sideTitle}>Intérêts</Text>{lines(cv.interests).map((interest) => <Text key={interest} style={sidebarPdfStyles.sideText}>• {interest}</Text>)}</View><View style={sidebarPdfStyles.main}><Text style={[sidebarPdfStyles.h1, { color: cv.accent }]}>{cv.name}</Text><Text style={sidebarPdfStyles.role}>{cv.title}</Text><Text style={[sidebarPdfStyles.sectionTitle, { color: cv.accent }]}>Profil</Text><Text>{cv.profile}</Text><Text style={[sidebarPdfStyles.sectionTitle, { color: cv.accent }]}>Expériences</Text>{cv.experiences.map((item, index) => <View key={index} style={sidebarPdfStyles.item}><Text style={sidebarPdfStyles.itemTitle}>{item.role} — {item.company}</Text><Text style={sidebarPdfStyles.muted}>{item.date} · {item.place}</Text><Text>{item.description}</Text></View>)}<Text style={[sidebarPdfStyles.sectionTitle, { color: cv.accent }]}>Formation</Text>{cv.education.map((item, index) => <View key={index} style={sidebarPdfStyles.item}><Text style={sidebarPdfStyles.itemTitle}>{item.degree}</Text><Text style={sidebarPdfStyles.muted}>{item.school} · {item.date} · {item.place}</Text></View>)}</View></Page></Document>;
}

function CVPdf({ cv }: { cv: CV }) {
	return cv.template === "sidebar" ? <SidebarPdf cv={cv} /> : <ClassicPdf cv={cv} />;
}

export function CVStudioApp() {
	const [cv, setCv] = useState<CV>(() => { try { const stored = localStorage.getItem(storageKey); return stored ? { ...sample, ...JSON.parse(stored) } : sample; } catch { return sample; } });
	useEffect(() => { localStorage.setItem(storageKey, JSON.stringify(cv)); }, [cv]);
	const fileName = useMemo(() => `${(cv.name || "CV").replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, "")}.pdf`, [cv.name]);
	return <div className="cv-studio-app"><Editor cv={cv} setCv={setCv} /><section className="cv-stage"><div className="cv-toolbar"><div><strong>Aperçu direct</strong><span>Les données restent dans ton navigateur.</span></div><div className="cv-toolbar-actions"><button onClick={() => setCv(sample)}>Réinitialiser</button><PDFDownloadLink className="cv-pdf-button" document={<CVPdf cv={cv} />} fileName={fileName}>Télécharger PDF</PDFDownloadLink></div></div><Preview cv={cv} /></section></div>;
}
