export interface Course {
	id: number;
	name: string;
	description: string;
	semester: number;
	year: number;
	field: string;
	keywords: string;
	ta_needed: number;
	deleted: boolean;
}
