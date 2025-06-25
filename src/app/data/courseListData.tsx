export interface Course {
	id: number;
	hkust_identifier: string;
	name: string;
	description: string;
	semester: string;
	year: number;
	ta_needed: number;
	ta_assigned: number;
	deleted: boolean;
	area: string[];
	qualification: string[];
	field: string;
}
