import { Component } from '@angular/core';
import { FooterComponent } from '../footer/footer.component';

const FUN_FACTS = [
  'Nearly half of India\'s workforce is engaged in agriculture.',
  'India is the world\'s largest producer of milk, pulses and jute.',
  'Drip irrigation can cut water use by 30–60% compared with flood irrigation.',
  'A healthy teaspoon of soil holds more microorganisms than there are people on Earth.',
];

@Component({
  selector: 'app-about-us',
  imports: [FooterComponent],
  templateUrl: './about-us.component.html',
  styleUrl: './about-us.component.css',
})
export class AboutUsComponent {
  protected readonly funFact = FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)];
}
