import type { ContactKey, CV } from "./cv-data";
import { Circle, Document, Image, Page, Path, StyleSheet, Svg, Text, View } from "@react-pdf/renderer";
import { contactItems, lines, parseLanguage } from "./cv-data";

const ICON_STROKE = { strokeWidth: 2, fill: "none", strokeLinecap: "round", strokeLinejoin: "round" } as const;

/** Small line icon drawn per contact field (email/phone/city/nationality/age). */
const ContactIcon = ({ name, color, size = 9 }: { name: ContactKey; color: string; size?: number }) => (
	<Svg width={size} height={size} viewBox="0 0 24 24">
		{name === "email" && (
			<>
				<Path d="M3 5.5h18v13H3z" stroke={color} {...ICON_STROKE} />
				<Path d="M3 6.5l9 6.5 9-6.5" stroke={color} {...ICON_STROKE} />
			</>
		)}
		{name === "phone" && (
			<Path
				d="M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.13 1 .35 1.9.66 2.8a2 2 0 0 1-.45 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.45c.9.3 1.85.53 2.8.66a2 2 0 0 1 1.7 2z"
				stroke={color}
				{...ICON_STROKE}
			/>
		)}
		{name === "city" && (
			<>
				<Path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" stroke={color} {...ICON_STROKE} />
				<Circle cx={12} cy={10} r={2.6} stroke={color} {...ICON_STROKE} />
			</>
		)}
		{name === "nationality" && (
			<>
				<Circle cx={12} cy={12} r={9} stroke={color} {...ICON_STROKE} />
				<Path d="M3 12h18" stroke={color} {...ICON_STROKE} />
				<Path d="M12 3c2.6 2.7 2.6 15.3 0 18c-2.6-2.7-2.6-15.3 0-18z" stroke={color} {...ICON_STROKE} />
			</>
		)}
		{name === "age" && (
			<>
				<Path d="M5 6.5h14v13H5z" stroke={color} {...ICON_STROKE} />
				<Path d="M5 10.5h14" stroke={color} {...ICON_STROKE} />
				<Path d="M9 3.5v4M15 3.5v4" stroke={color} {...ICON_STROKE} />
			</>
		)}
	</Svg>
);

/** Row of 5 proficiency dots (filled up to `count`). */
const Dots = ({ count, filled, empty }: { count: number; filled: string; empty: string }) => (
	<View style={{ flexDirection: "row", marginTop: 3 }}>
		{[1, 2, 3, 4, 5].map((i) => (
			<View
				key={i}
				style={{ width: 5, height: 5, borderRadius: 2.5, marginRight: 3, backgroundColor: i <= count ? filled : empty }}
			/>
		))}
	</View>
);

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
	item: { marginBottom: 8 },
	itemTitle: { fontSize: 11, fontWeight: 700, marginBottom: 1.5 },
	itemMeta: { fontSize: 9, color: "#7b8794", marginBottom: 2.5 },
	tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 1 },
});

const classicStyles = StyleSheet.create({
	page: {
		paddingVertical: 32,
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
		marginBottom: 13,
		paddingBottom: 12,
		borderBottomWidth: 1,
		borderBottomColor: "#e4e7eb",
	},
	photo: { width: 98, height: 98, borderRadius: 49, objectFit: "cover" },
	contactRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 5 },
	contactChip: { flexDirection: "row", alignItems: "center", marginRight: 12, marginBottom: 3 },
	contactText: { fontSize: 9.5, lineHeight: 1, color: "#7b8794", marginLeft: 4 },
	langRight: { alignItems: "flex-end" },
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
		width: 132,
		height: 132,
		borderRadius: 66,
		alignSelf: "center",
		marginBottom: 20,
		padding: 3,
		backgroundColor: "rgba(255,255,255,0.16)",
	},
	photo: { width: "100%", height: "100%", borderRadius: 63, objectFit: "cover" },
	sideText: { fontSize: 9.5, color: "rgba(255,255,255,0.88)", marginBottom: 4 },
	contactRow: { flexDirection: "row", alignItems: "center", marginBottom: 5 },
	contactText: { fontSize: 9.5, lineHeight: 1, color: "rgba(255,255,255,0.88)", marginLeft: 6, flex: 1 },
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
	sideLangName: { color: "#ffffff", fontWeight: 700, fontSize: 9.5, marginBottom: 1.5 },
	langLevel: { fontSize: 9, color: "rgba(255,255,255,0.7)" },
	dot: { color: "rgba(255,255,255,0.6)" },
});

/** Section title with a short accent underline (modern, softer than a full rule). */
const MainTitle = ({ children, accent }: { children: string; accent: string }) => (
	<View style={{ marginTop: 12, marginBottom: 6 }}>
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
						<View style={classicStyles.contactRow}>
							{cv.showIcons ? (
								contactItems(cv).map((item) => (
									<View key={item.key} style={classicStyles.contactChip}>
										<ContactIcon name={item.key} color="#7b8794" size={8.5} />
										<Text style={classicStyles.contactText}>{item.value}</Text>
									</View>
								))
							) : (
								<Text style={classicStyles.contactText}>
									{contactItems(cv)
										.map((item) => item.value)
										.join("  ·  ")}
								</Text>
							)}
						</View>
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
						<View key={line} style={classicStyles.lang} wrap={false}>
							<Text style={shared.itemTitle}>{lang.name}</Text>
							<View style={classicStyles.langRight}>
								{lang.level ? <Text style={shared.itemMeta}>{lang.level}</Text> : null}
								{lang.dots > 0 && <Dots count={lang.dots} filled={cv.accent} empty="#dde3ea" />}
							</View>
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
					{contactItems(cv).map((item) => (
						<View key={item.key} style={sidebarStyles.contactRow}>
							{cv.showIcons && <ContactIcon name={item.key} color="rgba(255,255,255,0.72)" />}
							<Text style={sidebarStyles.contactText}>{item.value}</Text>
						</View>
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
							<View key={line} style={{ marginBottom: 12 }} wrap={false}>
								<Text style={sidebarStyles.sideLangName}>{lang.name}</Text>
								{lang.level ? <Text style={sidebarStyles.langLevel}>{lang.level}</Text> : null}
								{lang.dots > 0 && <Dots count={lang.dots} filled="#ffffff" empty="rgba(255,255,255,0.28)" />}
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
