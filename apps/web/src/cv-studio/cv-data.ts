export type Experience = { role: string; company: string; date: string; place: string; description: string };
export type Education = { degree: string; school: string; date: string; place: string };
export type CV = {
	name: string;
	title: string;
	email: string;
	phone: string;
	city: string;
	nationality: string;
	age: string;
	photo: string;
	profile: string;
	skills: string;
	languages: string;
	interests: string;
	experiences: Experience[];
	education: Education[];
	accent: string;
	template: "classic" | "sidebar" | "minimal";
	showIcons: boolean;
};

export const storageKey = "cv-studio-standalone-v2";

export const sample: CV = {
	name: "Prénom NOM",
	title: "Commerciale B2B",
	email: "email@example.com",
	phone: "+33 0 00 00 00 00",
	city: "Île-de-France",
	nationality: "Française",
	age: "29 ans",
	photo: "",
	profile:
		"Commerciale orientée développement et fidélisation, avec une expérience en vente B2B, gestion de comptes clients, appels d'offres et outils CRM. Organisée, autonome et dotée d'un excellent relationnel.",
	skills:
		"Prospection multicanale\nNégociation commerciale\nGestion du cycle de vente\nFidélisation client\nRéponse aux appels d'offres\nCRM, Excel, Office",
	languages: "Français | langue maternelle | 5\nAnglais | courant | 4\nAllemand | notions professionnelles | 2",
	interests: "Théâtre\nSport\nEngagement associatif",
	experiences: [
		{
			role: "Commerciale",
			company: "Entreprise A",
			date: "2024 – 2025",
			place: "Paris",
			description:
				"Prospection client, fidélisation, propositions commerciales, négociation, suivi des contrats et gestion CRM.",
		},
		{
			role: "Assistante commerciale",
			company: "Entreprise B",
			date: "2019 – 2022",
			place: "Nanterre",
			description:
				"Renouvellement de contrats, ventes additionnelles, gestion de base de données, relances et coordination administrative.",
		},
	],
	education: [
		{ degree: "Master Négociation Commerciale Internationale", school: "Université", date: "2014", place: "Paris" },
		{ degree: "BTS Commerce International", school: "Lycée", date: "2011", place: "Île-de-France" },
	],
	accent: "#123047",
	template: "sidebar",
	showIcons: true,
};

export const lines = (value: string) =>
	value
		.split("\n")
		.map((item) => item.trim())
		.filter(Boolean);

/**
 * Parse a language line "Name | level | note(1-5)". The note is optional and,
 * when present, drives the visual proficiency dots. Anything after the 2nd pipe
 * that is not a 1-5 number is folded back into the textual level.
 */
export const parseLanguage = (line: string) => {
	const [name = "", level = "", note = ""] = line.split("|").map((item) => item.trim());
	const parsed = Number(note);
	const dots = note !== "" && Number.isFinite(parsed) ? Math.max(0, Math.min(5, Math.round(parsed))) : 0;
	const extraLevel = note !== "" && dots === 0 ? ` ${note}` : "";
	return { name, level: `${level}${extraLevel}`.trim(), dots };
};

export type ContactKey = "email" | "phone" | "city" | "nationality" | "age";

/** Contact fields in display order (typed, so each can carry its own icon), empties removed. */
export const contactItems = (cv: CV): { key: ContactKey; value: string }[] =>
	(
		[
			["email", cv.email],
			["phone", cv.phone],
			["city", cv.city],
			["nationality", cv.nationality],
			["age", cv.age],
		] as [ContactKey, string][]
	)
		.filter(([, value]) => value)
		.map(([key, value]) => ({ key, value }));

/** Contact fields in display order, empties removed. Shared by preview + PDF. */
export const contactValues = (cv: CV) => contactItems(cv).map((item) => item.value);

/** Curated accent presets for the colour palette. */
export const PALETTE = ["#123047", "#1f3a5f", "#0f3d3e", "#264d3b", "#7a1f2b", "#4a2c5a", "#3a2e39", "#2b2f33"];
