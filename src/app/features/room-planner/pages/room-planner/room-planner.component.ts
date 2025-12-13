import { Component } from '@angular/core';
import { ThreeSceneComponent } from '../../components/three-scene/three-scene.component';

@Component({
  selector: 'app-room-planner',
  standalone: true,
  imports: [ThreeSceneComponent],
  templateUrl: './room-planner.component.html',
  styleUrl: './room-planner.component.css'
})
export class RoomPlannerComponent {
}
