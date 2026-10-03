import { Component } from '@angular/core';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-services',
  imports: [FooterComponent],
  templateUrl: './services.component.html',
  styleUrl: './services.component.css',
})
export class ServicesComponent {
  protected readonly services = [
    { icon: '💰', title: 'Agricultural Loans', desc: 'Browse crop, equipment, dairy and irrigation loan schemes with clear rates and eligibility.' },
    { icon: '📝', title: 'Online Applications', desc: 'Apply from your phone with your farm details and a photo of your documents – no queues.' },
    { icon: '📊', title: 'Application Tracking', desc: 'See the status of every application and the remarks left by the reviewing officer.' },
    { icon: '🧮', title: 'EMI Calculator', desc: 'Estimate your monthly instalment and total repayment before you apply.' },
    { icon: '💬', title: 'Feedback & Support', desc: 'Tell us how we are doing and reach our support team whenever you need help.' },
    { icon: '🔒', title: 'Secure by Design', desc: 'Your data and documents are protected and only visible to you and our loan officers.' },
  ];
}
