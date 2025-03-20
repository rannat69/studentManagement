export interface Course {
	id: number;
	hkust_identifier: string;
	name: string;
	description: string;
	semester: number;
	year: number;
	ta_needed: number;
	ta_assigned: number;
	deleted: boolean;
	
}
