package com.farmaid.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Supporting document for a loan application, stored as a base64 data URL
 * (e.g. "data:image/png;base64,..."). Kept in its own table so application lists never load it.
 */
@Entity
@Table(name = "application_documents")
@Getter
@Setter
@NoArgsConstructor
public class ApplicationDocument {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long documentId;

	@Lob
	@Column(nullable = false, columnDefinition = "LONGTEXT")
	private String data;

	public ApplicationDocument(String data) {
		this.data = data;
	}
}
