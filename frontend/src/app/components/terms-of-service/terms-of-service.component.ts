import { Component, signal } from '@angular/core';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-terms-of-service',
  imports: [FooterComponent],
  templateUrl: './terms-of-service.component.html',
  styleUrl: './terms-of-service.component.css',
})
export class TermsOfServiceComponent {
  protected readonly terms = [
    { title: '🌾 Using FarmAid', content: 'FarmAid is a platform for discovering agricultural loan schemes and applying for them. You must provide accurate information about yourself and your farm.' },
    { title: '👤 Your Account', content: 'Keep your password safe. You are responsible for activity on your account. Tell us immediately if you suspect unauthorised access.' },
    { title: '📄 Applications & Documents', content: 'Uploaded documents must be genuine and belong to you. Submitting an application does not guarantee approval; decisions are made by our loan officers.' },
    { title: '🚫 Acceptable Use', content: 'Do not misuse the service, attempt to access other users\' data, or upload harmful files. We may suspend accounts that break these rules.' },
    { title: '🔄 Changes', content: 'We may update these terms as the service evolves. Continued use after an update means you accept the revised terms.' },
  ].map((t) => ({ ...t, open: signal(false) }));
}
