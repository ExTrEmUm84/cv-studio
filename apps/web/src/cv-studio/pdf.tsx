import type { CV } from "./cv-data";
import { Circle, Document, Image, Page, StyleSheet, Svg, Text, View } from "@react-pdf/renderer";
import { contactValues, lines, parseLanguage } from "./cv-data";

const A4_HEIGHT = 841.89;
const SIDE_WIDTH = 200;

/** Subtle "wallpaper" dot grid painted over the sidebar background. */
const patternDots = () => {
	const dots = [];
	for (let y = 16; y < A4_HEIGHT; y += 15) {
		for (let x = 10; x < SIDE_WIDTH; x += 15) {
			dots.push(<Circle key={`${x}-${y}`} cx={x} cy={y} r={1.1} fill="#ffffff" fillOpacity={0.06} />);
		}
	}
	return dots;
};

const shared = StyleSheet.create({
	body: { fontSize: 10, lineHeight: 1.4, color: "#1f2933" },
	name: { fontSize: 26, fontWeight: 700, marginBottom: 2 },
	role: { fontSize: 12.5, fontWeight: 500, color: "#52606d", marginBottom: 12 },
	item: { marginBottom: 9 },
	itemTitle: { fontSize: 11, fontWeight: 700, marginBottom: 1.5 },
	itemMeta: { fontSize: 9, color: "#7b8794", marginBottom: 2.5 },
	tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 1 },
});

const classicStyles = StyleSheet.create({
	page: {
		paddingVertical: 38,
		paddingHorizontal: 40,
		fontFamily: "Helvetica",
		color: "#1f2933",
		fontSize: 10,
		lineHeight: 1.4,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		gap: 18,
		marginBottom: 18,
		paddingBottom: 16,
		borderBottomWidth: 1,
		borderBottomColor: "#e4e7eb",
	},
	photo: { width: 84, height: 84, borderRadius: 42, objectFit: "cover" },
	contact: { fontSize: 9.5, color: "#7b8794", marginTop: 2 },
	tag: {
		backgroundColor: "#eef2f6",
		borderRadius: 9,
		paddingHorizontal: 8,
		paddingVertical: 4,
		marginBottom: 4,
		alignItems: "center",
		justifyContent: "center",
	},
	tagText: { color: "#3e4c59", fontSize: 9, lineHeight: 1 },
	lang: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		borderBottomWidth: 1,
		borderBottomColor: "#f0f2f5",
		paddingBottom: 3.5,
		marginBottom: 3.5,
	},
});

const sidebarStyles = StyleSheet.create({
	page: { flexDirection: "row", fontFamily: "Helvetica", color: "#1f2933", fontSize: 10, lineHeight: 1.4 },
	bg: { position: "absolute", top: 0, left: 0, width: SIDE_WIDTH, height: "100%" },
	side: { width: SIDE_WIDTH, paddingTop: 30, paddingBottom: 26, paddingHorizontal: 20 },
	main: { flex: 1, paddingTop: 34, paddingBottom: 30, paddingHorizontal: 28 },
	photoWrap: {
		width: 104,
		height: 104,
		borderRadius: 52,
		alignSelf: "center",
		marginBottom: 18,
		padding: 3,
		backgroundColor: "rgba(255,255,255,0.16)",
	},
	photo: { width: "100%", height: "100%", borderRadius: 50, objectFit: "cover" },
	sideText: { fontSize: 9.5, color: "rgba(255,255,255,0.88)", marginBottom: 4 },
	sideTag: {
		backgroundColor: "rgba(255,255,255,0.16)",
		borderRadius: 8,
		paddingHorizontal: 7,
		paddingVertical: 4,
		marginRight: 4,
		marginBottom: 4,
		alignItems: "center",
		justifyContent: "center",
	},
	sideTagText: { color: "#ffffff", fontSize: 8.5, lineHeight: 1 },
	sideLangName: { color: "#ffffff", fontWeight: 700, fontSize: 9.5 },
	dot: { color: "rgba(255,255,255,0.6)" },
});

/** Section title with a short accent underline (modern, softer than a full rule). */
const MainTitle = ({ children, accent }: { children: string; accent: string }) => (
	<View style={{ marginTop: 15, marginBottom: 7 }}>
		<Text style={{ fontSize: 9.5, letterSpacing: 1.3, color: accent, fontWeight: 700 }}>{children.toUpperCase()}</Text>
		<View style={{ width: 26, height: 2, backgroundColor: accent, borderRadius: 1, marginTop: 4 }} />
	</View>
);

const SideTitle = ({ children }: { children: string }) => (
	<View style={{ marginTop: 18, marginBottom: 8 }}>
		<Text style={{ fontSize: 9, letterSpacing: 1.4, color: "#ffffff", fontWeight: 700 }}>{children.toUpperCase()}</Text>
		<View style={{ width: 22, height: 2, backgroundColor: "rgba(255,255,255,0.55)", borderRadius: 1, marginTop: 4 }} />
	</View>
);

const ExperienceBlock = ({ cv }: { cv: CV }) => (
	<>
		{cv.experiences.map((item, index) => (
			<View key={index} style={shared.item} wrap={false}>
				<Text style={shared.itemTitle}>
					{item.role} — {item.company}
				</Text>
				<Text style={shared.itemMeta}>{[item.date, item.place].filter(Boolean).join(" · ")}</Text>
				<Text>{item.description}</Text>
			</View>
		))}
	</>
);

const EducationBlock = ({ cv }: { cv: CV }) => (
	<>
		{cv.education.map((item, index) => (
			<View key={index} style={shared.item} wrap={false}>
				<Text style={shared.itemTitle}>{item.degree}</Text>
				<Text style={shared.itemMeta}>{[item.school, item.date, item.place].filter(Boolean).join(" · ")}</Text>
			</View>
		))}
	</>
);

function ClassicPdf({ cv }: { cv: CV }) {
	return (
		<Document title={cv.name || "CV"}>
			<Page size="A4" style={classicStyles.page}>
				<View style={classicStyles.header}>
					{cv.photo && <Image src={cv.photo} style={classicStyles.photo} />}
					<View>
						<Text style={[shared.name, { color: cv.accent }]}>{cv.name}</Text>
						<Text style={shared.role}>{cv.title}</Text>
						<Text style={classicStyles.contact}>{contactValues(cv).join(" · ")}</Text>
					</View>
				</View>

				<MainTitle accent={cv.accent}>Profil</MainTitle>
				<Text>{cv.profile}</Text>

				<MainTitle accent={cv.accent}>Expériences</MainTitle>
				<ExperienceBlock cv={cv} />

				<MainTitle accent={cv.accent}>Compétences</MainTitle>
				<View style={shared.tagRow}>
					{lines(cv.skills).map((skill) => (
						<View key={skill} style={classicStyles.tag}>
							<Text style={classicStyles.tagText}>{skill}</Text>
						</View>
					))}
				</View>

				<MainTitle accent={cv.accent}>Formation</MainTitle>
				<EducationBlock cv={cv} />

				<MainTitle accent={cv.accent}>Langues</MainTitle>
				{lines(cv.languages).map((line) => {
					const lang = parseLanguage(line);
					return (
						<View key={line} style={classicStyles.lang}>
							<Text style={shared.itemTitle}>{lang.name}</Text>
							<Text style={shared.itemMeta}>{lang.level}</Text>
						</View>
					);
				})}

				{lines(cv.interests).length > 0 && (
					<>
						<MainTitle accent={cv.accent}>Intérêts</MainTitle>
						<Text>{lines(cv.interests).join(" · ")}</Text>
					</>
				)}
			</Page>
		</Document>
	);
}

function SidebarPdf({ cv }: { cv: CV }) {
	return (
		<Document title={cv.name || "CV"}>
			<Page size="A4" style={sidebarStyles.page}>
				{/* Fixed full-height patterned background — repeats cleanly on overflow pages. */}
				<View fixed style={[sidebarStyles.bg, { backgroundColor: cv.accent }]}>
					<Svg width={SIDE_WIDTH} height={A4_HEIGHT} style={{ position: "absolute", top: 0, left: 0 }}>
						{patternDots()}
					</Svg>
				</View>

				<View style={sidebarStyles.side}>
					{cv.photo && (
						<View style={sidebarStyles.photoWrap}>
							<Image src={cv.photo} style={sidebarStyles.photo} />
						</View>
					)}

					<SideTitle>Coordonnées</SideTitle>
					{contactValues(cv).map((value) => (
						<Text key={value} style={sidebarStyles.sideText}>
							{value}
						</Text>
					))}

					<SideTitle>Compétences</SideTitle>
					<View style={shared.tagRow}>
						{lines(cv.skills).map((skill) => (
							<View key={skill} style={sidebarStyles.sideTag}>
								<Text style={sidebarStyles.sideTagText}>{skill}</Text>
							</View>
						))}
					</View>

					<SideTitle>Langues</SideTitle>
					{lines(cv.languages).map((line) => {
						const lang = parseLanguage(line);
						return (
							<View key={line} style={{ marginBottom: 6 }} wrap={false}>
								<Text style={sidebarStyles.sideLangName}>{lang.name}</Text>
								<Text style={sidebarStyles.sideText}>{lang.level}</Text>
							</View>
						);
					})}

					<SideTitle>Intérêts</SideTitle>
					{lines(cv.interests).map((interest) => (
						<Text key={interest} style={sidebarStyles.sideText}>
							<Text style={sidebarStyles.dot}>• </Text>
							{interest}
						</Text>
					))}
				</View>

				<View style={sidebarStyles.main}>
					<Text style={[shared.name, { color: cv.accent }]}>{cv.name}</Text>
					<Text style={shared.role}>{cv.title}</Text>

					<MainTitle accent={cv.accent}>Profil</MainTitle>
					<Text>{cv.profile}</Text>

					<MainTitle accent={cv.accent}>Expériences</MainTitle>
					<ExperienceBlock cv={cv} />

					<MainTitle accent={cv.accent}>Formation</MainTitle>
					<EducationBlock cv={cv} />
				</View>
			</Page>
		</Document>
	);
}

export function CVPdf({ cv }: { cv: CV }) {
	return cv.template === "sidebar" ? <SidebarPdf cv={cv} /> : <ClassicPdf cv={cv} />;
}
