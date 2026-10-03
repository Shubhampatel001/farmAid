INSERT INTO loans (loan_type, description, interest_rate, maximum_amount, repayment_tenure, eligibility, documents_required, active) VALUES
('Kisan Crop Loan', 'Short-term working capital for seeds, fertilisers, pesticides and labour during the cropping season.', 7.0, 300000, 12,
 'Owner or tenant farmers cultivating at least 0.5 acre.', 'Aadhaar card, land records or lease agreement, bank passbook', TRUE),
('Farm Equipment Loan', 'Finance for tractors, power tillers, harvesters and irrigation pumps.', 9.5, 1500000, 60,
 'Farmers with at least 2 acres of cultivable land and a repayment track record.', 'Aadhaar card, land records, equipment quotation, bank statements (6 months)', TRUE),
('Dairy and Livestock Loan', 'Purchase of milch animals, poultry or goats and construction of sheds.', 8.5, 500000, 36,
 'Farmers or groups with space and fodder arrangements for livestock.', 'Aadhaar card, project report, veterinary certificate', TRUE),
('Irrigation Development Loan', 'Drip or sprinkler systems, borewells and farm ponds to improve water use.', 8.0, 800000, 48,
 'Land-owning farmers with water source feasibility.', 'Aadhaar card, land records, irrigation plan or quotation', TRUE);
