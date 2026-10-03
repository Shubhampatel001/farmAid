package com.farmaid.config;

import com.farmaid.model.*;
import com.farmaid.repository.FeedbackRepository;
import com.farmaid.repository.LoanApplicationRepository;
import com.farmaid.repository.LoanRepository;
import com.farmaid.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Fills the in-memory demo database with farmers, applications in every status, and feedback,
 * so visitors can explore both the farmer and admin views without registering.
 * Loan schemes come from Flyway (V2__seed_loans.sql) and the admin from {@link AdminSeeder}.
 */
@Component
@Profile("demo")
@Order(10)
public class DemoDataSeeder implements ApplicationRunner {

	private static final Logger log = LoggerFactory.getLogger(DemoDataSeeder.class);

	private final UserRepository users;
	private final LoanRepository loans;
	private final LoanApplicationRepository applications;
	private final FeedbackRepository feedback;
	private final PasswordEncoder passwordEncoder;
	private final String farmerPassword;

	public DemoDataSeeder(UserRepository users, LoanRepository loans, LoanApplicationRepository applications,
						  FeedbackRepository feedback, PasswordEncoder passwordEncoder,
						  @Value("${app.demo.farmer-password}") String farmerPassword) {
		this.users = users;
		this.loans = loans;
		this.applications = applications;
		this.feedback = feedback;
		this.passwordEncoder = passwordEncoder;
		this.farmerPassword = farmerPassword;
	}

	@Override
	@Transactional
	public void run(ApplicationArguments args) {
		if (applications.count() > 0) {
			return;
		}
		Map<String, Loan> loan = loans.findAll().stream().collect(Collectors.toMap(Loan::getLoanType, Function.identity()));
		Loan crop = loan.get("Kisan Crop Loan");
		Loan equipment = loan.get("Farm Equipment Loan");
		Loan dairy = loan.get("Dairy and Livestock Loan");
		Loan irrigation = loan.get("Irrigation Development Loan");

		User ravi = farmer("ravi@farmaid.demo", "Ravi Kumar", "9876543210");
		User priya = farmer("priya@farmaid.demo", "Priya Sahu", "9123456780");
		User arjun = farmer("arjun@farmaid.demo", "Arjun Patel", "9988776655");

		List<LoanApplication> apps = new ArrayList<>();
		apps.add(app(ravi, crop, 12, ApplicationStatus.PENDING, null, 80000, "Odisha", "Khordha", "Jatni village, plot 112",
				"Near Panchayat office, Jatni, Khordha", 2.5, "Paddy cultivation for kharif season"));
		apps.add(app(ravi, dairy, 40, ApplicationStatus.APPROVED, "Documents verified. Disbursal within 7 working days.", 250000,
				"Odisha", "Khordha", "Jatni village, plot 118", "Near Panchayat office, Jatni, Khordha", 2.5,
				"Purchase of 4 milch cows and a shed"));
		apps.add(app(priya, equipment, 25, ApplicationStatus.REJECTED,
				"Land records are incomplete. Please re-apply with the updated RoR document.", 600000,
				"Karnataka", "Mandya", "Maddur taluk, survey no. 45", "2nd Cross, Maddur, Mandya", 4.0, "Purchase of a 35 HP tractor"));
		apps.add(app(priya, irrigation, 5, ApplicationStatus.PENDING, null, 350000, "Karnataka", "Mandya",
				"Maddur taluk, survey no. 45", "2nd Cross, Maddur, Mandya", 4.0, "Drip irrigation for sugarcane"));
		apps.add(app(arjun, crop, 60, ApplicationStatus.CANCELLED, null, 50000, "Gujarat", "Anand",
				"Borsad road farm", "Station Road, Anand", 1.5, "Vegetable farming"));
		apps.add(app(arjun, irrigation, 18, ApplicationStatus.APPROVED, "Approved. Field verification completed on site.", 200000,
				"Gujarat", "Anand", "Borsad road farm", "Station Road, Anand", 1.5, "Farm pond and sprinkler system"));
		applications.saveAll(apps);

		feedback.saveAll(List.of(
				feedback(ravi, 5, 30, "The dairy loan was approved quickly and the remarks told me exactly what happens next."),
				feedback(priya, 3, 20, "Rejection reason was clear. It would help to upload more than one document."),
				feedback(arjun, 4, 10, "Easy to compare schemes. The EMI calculator helped me choose the irrigation loan.")));

		log.info("Demo data ready: 3 farmers (password {}), {} applications, 3 feedback entries", farmerPassword, apps.size());
	}

	private User farmer(String email, String name, String mobile) {
		User user = new User();
		user.setEmail(email);
		user.setUsername(name);
		user.setMobileNumber(mobile);
		user.setPassword(passwordEncoder.encode(farmerPassword));
		user.setRole(Role.USER);
		return users.save(user);
	}

	private static LoanApplication app(User user, Loan loan, int daysAgo, ApplicationStatus status, String remarks, double amount,
									   String state, String district, String location, String address, double acres, String purpose) {
		LoanApplication app = new LoanApplication();
		app.setUser(user);
		app.setLoan(loan);
		app.setSubmissionDate(LocalDate.now().minusDays(daysAgo));
		app.setStatus(status);
		app.setAdminRemarks(remarks);
		app.setRequestedAmount(amount);
		app.setState(state);
		app.setDistrict(district);
		app.setFarmLocation(location);
		app.setFarmerAddress(address);
		app.setFarmSizeInAcres(acres);
		app.setFarmPurpose(purpose);
		app.setDocument(new ApplicationDocument(samplePdf(user.getUsername(), location, acres)));
		return app;
	}

	private static Feedback feedback(User user, int rating, int daysAgo, String text) {
		Feedback f = new Feedback();
		f.setUser(user);
		f.setRating(rating);
		f.setDate(LocalDate.now().minusDays(daysAgo));
		f.setFeedbackText(text);
		return f;
	}

	/** A one-page "land record" PDF (standard Helvetica, no fonts needed on the server) as a data URL. */
	static String samplePdf(String owner, String location, double acres) {
		String text = "BT /F1 20 Tf 60 760 Td (FarmAid - Sample Land Record) Tj ET\n"
				+ "BT /F1 12 Tf 60 720 Td (Owner: " + pdfEscape(owner) + ") Tj ET\n"
				+ "BT /F1 12 Tf 60 700 Td (Location: " + pdfEscape(location) + ") Tj ET\n"
				+ "BT /F1 12 Tf 60 680 Td (Area: " + acres + " acres) Tj ET\n"
				+ "BT /F1 10 Tf 60 640 Td (Demo document - not a real record.) Tj ET\n";
		List<String> objects = List.of(
				"<< /Type /Catalog /Pages 2 0 R >>",
				"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
				"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
				"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
				"<< /Length " + text.getBytes(StandardCharsets.ISO_8859_1).length + " >>\nstream\n" + text + "endstream");

		ByteArrayOutputStream out = new ByteArrayOutputStream();
		List<Integer> offsets = new ArrayList<>();
		write(out, "%PDF-1.4\n");
		for (int i = 0; i < objects.size(); i++) {
			offsets.add(out.size());
			write(out, (i + 1) + " 0 obj\n" + objects.get(i) + "\nendobj\n");
		}
		int xref = out.size();
		StringBuilder trailer = new StringBuilder("xref\n0 " + (objects.size() + 1) + "\n0000000000 65535 f \n");
		offsets.forEach(o -> trailer.append(String.format("%010d 00000 n \n", o)));
		trailer.append("trailer\n<< /Size ").append(objects.size() + 1).append(" /Root 1 0 R >>\nstartxref\n").append(xref).append("\n%%EOF\n");
		write(out, trailer.toString());
		return "data:application/pdf;base64," + Base64.getEncoder().encodeToString(out.toByteArray());
	}

	private static String pdfEscape(String s) {
		return s.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)");
	}

	private static void write(ByteArrayOutputStream out, String s) {
		out.writeBytes(s.getBytes(StandardCharsets.ISO_8859_1));
	}
}
