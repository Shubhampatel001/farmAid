package com.farmaid.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "loans")
@Getter
@Setter
@NoArgsConstructor
public class Loan {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long loanId;

	@Column(nullable = false, unique = true)
	private String loanType;

	@Column(nullable = false, length = 2000)
	private String description;

	private double interestRate;

	private double maximumAmount;

	/** Repayment tenure in months. */
	private int repaymentTenure;

	@Column(nullable = false, length = 1000)
	private String eligibility;

	@Column(nullable = false, length = 1000)
	private String documentsRequired;

	private boolean active = true;
}
