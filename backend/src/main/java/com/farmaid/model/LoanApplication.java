package com.farmaid.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "loan_applications")
@Getter
@Setter
@NoArgsConstructor
public class LoanApplication {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long loanApplicationId;

	@Column(nullable = false)
	private LocalDate submissionDate;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private ApplicationStatus status = ApplicationStatus.PENDING;

	private double requestedAmount;

	@Column(nullable = false)
	private String state;

	@Column(nullable = false)
	private String district;

	@Column(nullable = false)
	private String farmLocation;

	@Column(nullable = false, length = 500)
	private String farmerAddress;

	private double farmSizeInAcres;

	@Column(nullable = false, length = 1000)
	private String farmPurpose;

	@OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
	@JoinColumn(name = "document_id")
	private ApplicationDocument document;

	@Column(length = 1000)
	private String adminRemarks;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id")
	private User user;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "loan_id")
	private Loan loan;
}
