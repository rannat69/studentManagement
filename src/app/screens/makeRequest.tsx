"use client";

import React, { useEffect, useState } from "react";

import styles from "./styles/page.module.css";
import Modal from "./makeRequestModal"; // Adjust the import path as necessary
import { Request } from "../data/requestData";

import axios from "axios";

export default function MakeRequest() {
	const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [requestListState, setRequestListState] = useState<Request[]>();

	useEffect(() => {
		const fetchRequests = async () => {
			const response = await axios.get("http://localhost:5000/requests");

			setRequestListState(response.data);
		};

		fetchRequests();
	}, []);

	const handleClickRequest = (request: Request): void => {
		setSelectedRequest(request);
		setIsModalOpen(true);
	};

	const handleClickRequestNew = (): void => {
		setSelectedRequest(null);
		setIsModalOpen(true);
	};

	const handleSaveRequest = (updatedRequest: Request) => {
		// Update the request list with the new data
		if (!requestListState) {
			return;
		}

		let updatedList;

		// Check if the request is marked for deletion
		if (updatedRequest.deleted) {
			// Remove the request from the list
			updatedList = requestListState.filter(
				(request) => request.id !== updatedRequest.id
			);
		} else {
			// Check if the request exists in the list
			const requestExists = requestListState.some(
				(request) => request.id === updatedRequest.id
			);

			updatedList = requestExists
				? requestListState.map((request) =>
						request.id === updatedRequest.id ? updatedRequest : request
				  )
				: [...requestListState, updatedRequest];
		}

		// Update the state with the new request list
		setRequestListState(updatedList);
	};

	return (
		<div className={styles.page}>
			Request list
			<div className={styles.main}>
				{requestListState &&
					requestListState.map((request) => (
						<div
							key={request.id}
							className={styles.element}
							onClick={() => handleClickRequest(request)}>
							<h2>{request.message}</h2>
						</div>
					))}
			</div>
			<div className={styles.add} onClick={() => handleClickRequestNew()}>
				Make request
			</div>
			<footer className={styles.footer}>Le Footer</footer>
			<Modal
				isOpen={isModalOpen}
				request={selectedRequest}
				onClose={() => setIsModalOpen(false)}
				onSave={handleSaveRequest}
			/>
		</div>
	);
}
