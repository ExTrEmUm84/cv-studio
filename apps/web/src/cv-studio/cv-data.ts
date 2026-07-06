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
	languages: "Français | langue maternelle\nAnglais | courant\nAllemand | notions professionnelles",
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
};

export const lines = (value: string) =>
	value
		.split("\n")
		.map((item) => item.trim())
		.filter(Boolean);

export const parseLanguage = (line: string) => {
	const [name, ...rest] = line.split("|").map((item) => item.trim());
	return { name, level: rest.join(" ") };
};

/** Contact fields in display order, empties removed. Shared by preview + PDF. */
export const contactValues = (cv: CV) => [cv.email, cv.phone, cv.city, cv.nationality, cv.age].filter(Boolean);
