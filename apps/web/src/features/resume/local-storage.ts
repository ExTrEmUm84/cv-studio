import type { ResumeData } from "@reactive-resume/schema/resume/data";
import type { Resume } from "@/features/resume/builder/draft";
import { defaultResumeData } from "@reactive-resume/schema/resume/default";
import { sampleResumeData } from "@reactive-resume/schema/resume/sample";
import { generateId, generateRandomName, slugify } from "@reactive-resume/utils/string";

const storageKey = "cv-studio-resumes";
const changeEvent = "cv-studio-resumes-change";

type StoredResume = Omit<Resume, "createdAt" | "updatedAt"> & {
	createdAt: string;
	updatedAt: string;
};

const cloneData = (data: ResumeData): ResumeData => structuredClone(data);

const toResume = (resume: StoredResume): Resume => ({
	...resume,
	data: cloneData(resume.data),
	createdAt: new Date(resume.createdAt),
	updatedAt: new Date(resume.updatedAt),
});

const toStoredResume = (resume: Resume): StoredResume => ({
	...resume,
	data: cloneData(resume.data),
	createdAt: (resume.createdAt ?? resume.updatedAt).toISOString(),
	updatedAt: resume.updatedAt.toISOString(),
});

const emitChange = () => {
	if (typeof window === "undefined") return;
	window.dispatchEvent(new Event(changeEvent));
};

const readStoredResumes = (): StoredResume[] => {
	if (typeof window === "undefined") return [];

	try {
		const raw = window.localStorage.getItem(storageKey);
		if (!raw) return [];
		const resumes = JSON.parse(raw) as StoredResume[];
		return Array.isArray(resumes) ? resumes : [];
	} catch {
		return [];
	}
};

const writeStoredResumes = (resumes: StoredResume[]) => {
	if (typeof window === "undefined") return;
	window.localStorage.setItem(storageKey, JSON.stringify(resumes));
	emitChange();
};

export const subscribeToLocalResumes = (listener: () => void) => {
	if (typeof window === "undefined") return () => {};
	window.addEventListener(changeEvent, listener);
	window.addEventListener("storage", listener);
	return () => {
		window.removeEventListener(changeEvent, listener);
		window.removeEventListener("storage", listener);
	};
};

export const listLocalResumes = (): Resume[] =>
	readStoredResumes()
		.map(toResume)
		.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

export const getLocalResume = (id: string): Resume | undefined => listLocalResumes().find((resume) => resume.id === id);

export const saveLocalResume = (resume: Resume) => {
	const stored = readStoredResumes();
	const nextResume = toStoredResume({ ...resume, updatedAt: new Date() });
	const index = stored.findIndex((item) => item.id === resume.id);

	if (index === -1) stored.push(nextResume);
	else stored[index] = nextResume;

	writeStoredResumes(stored);
};

export const createLocalResume = (options?: { name?: string; withSampleData?: boolean }) => {
	const name = options?.name?.trim() || generateRandomName();
	const now = new Date();
	const resume: Resume = {
		id: generateId(),
		name,
		slug: slugify(name),
		tags: [],
		data: options?.withSampleData ? cloneData(sampleResumeData) : cloneData(defaultResumeData),
		isLocked: false,
		isPublic: false,
		hasPassword: false,
		createdAt: now,
		updatedAt: now,
	};

	saveLocalResume(resume);
	return resume;
};

export const duplicateLocalResume = (resume: Resume) => {
	const name = `${resume.name} Copy`;
	const duplicate: Resume = {
		...resume,
		id: generateId(),
		name,
		slug: slugify(name),
		isLocked: false,
		createdAt: new Date(),
		updatedAt: new Date(),
		data: cloneData(resume.data),
	};

	saveLocalResume(duplicate);
	return duplicate;
};

export const deleteLocalResume = (id: string) => {
	writeStoredResumes(readStoredResumes().filter((resume) => resume.id !== id));
};

export const updateLocalResumeMetadata = (id: string, values: Pick<Resume, "name" | "slug" | "tags">) => {
	const resume = getLocalResume(id);
	if (!resume) return;
	saveLocalResume({ ...resume, ...values });
};
