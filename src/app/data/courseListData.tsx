export interface Course {
	id: number;
	hkust_identifier: string;
	name: string;
	description: string;
	semester: number;
	year: number;
	field: string;
	keywords: string;
	ta_needed: number;
	ta_assigned: number;
	deleted: boolean;
}
