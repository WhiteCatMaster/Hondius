import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarPersonaje } from './editar-personaje';

describe('EditarPersonaje', () => {
  let component: EditarPersonaje;
  let fixture: ComponentFixture<EditarPersonaje>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarPersonaje],
    }).compileComponents();

    fixture = TestBed.createComponent(EditarPersonaje);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
