import { Component, computed, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { AcademicoService } from "../../core/services/academico.service";
import { AuthService } from "../../core/services/auth.service";
import { HorarioAdminService } from "../../core/services/horario-admin.service";
import { CursoAdminService } from "../../core/services/curso-admin.service";
import { UsuarioAdminService } from "../../core/services/usuario-admin.service";
import { ModalComponent } from "../../shared/ui/modal.component";
import { Dia, HorarioRecord } from "../../core/models/models";

interface DiaPill {
  abbr: Dia;
  fecha: number;
}

@Component({
  selector: "app-horario",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent],
  templateUrl: "./horario.component.html",
})
export class HorarioComponent {
  protected readonly academico = inject(AcademicoService);
  protected readonly auth = inject(AuthService);

  protected readonly dias: DiaPill[] = [
    { abbr: "LUN", fecha: 24 },
    { abbr: "MAR", fecha: 25 },
    { abbr: "MIE", fecha: 26 },
    { abbr: "JUE", fecha: 27 },
    { abbr: "VIE", fecha: 28 },
  ];

  readonly diaSeleccionado = signal<Dia>("MAR");

  readonly clasesDelDia = computed(() =>
    this.academico.horario.value().horario.filter((h) => h.dia === this.diaSeleccionado())
  );

  claseCategoriaClase(categoria: string): string {
    return categoria === "APE" ? "text-accent-600" : "text-brand-700";
  }

  exportarHorario(): void {
    const filas = this.academico.horario.value().horario;
    const contenido = filas.map((h) => `${h.dia} ${h.horaInicio}-${h.horaFin};${h.curso};${h.profesor}`).join("\n");
    const blob = new Blob([`Día Horario;Curso;Profesor\n${contenido}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mi-horario.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  // --- Solo para docente/admin ---
  protected readonly horarioAdmin = inject(HorarioAdminService);
  protected readonly cursoAdmin = inject(CursoAdminService);
  protected readonly usuarioAdmin = inject(UsuarioAdminService);
  private readonly fb = inject(FormBuilder);

  protected readonly modalAbierto = signal(false);
  protected readonly editando = signal<HorarioRecord | null>(null);
  protected readonly guardando = signal(false);
  protected readonly errorMsg = signal("");

  protected readonly diasDisponibles: Dia[] = ["LUN", "MAR", "MIE", "JUE", "VIE"];

  protected readonly filasAdmin = computed(() => {
    const cursos = this.cursoAdmin.cursos.value();
    const estudiantes = this.usuarioAdmin.estudiantes();
    return this.horarioAdmin.horario.value().map((h) => ({
      registro: h,
      estudiante: estudiantes.find((e) => e.id === h.estudianteId)?.nombre ?? `#${h.estudianteId}`,
      curso: cursos.find((c) => c.id === h.cursoId)?.nombre ?? `#${h.cursoId}`,
    }));
  });

  protected readonly form = this.fb.nonNullable.group({
    estudianteId: [0, [Validators.required, Validators.min(1)]],
    cursoId: [0, [Validators.required, Validators.min(1)]],
    dia: ["LUN" as Dia, Validators.required],
    fecha: [24, [Validators.required, Validators.min(1)]],
    horaInicio: ["08:00", Validators.required],
    horaFin: ["10:00", Validators.required],
  });

  abrirCrear(): void {
    this.editando.set(null);
    this.errorMsg.set("");
    this.form.reset({ estudianteId: 0, cursoId: 0, dia: "LUN", fecha: 24, horaInicio: "08:00", horaFin: "10:00" });
    this.modalAbierto.set(true);
  }

  abrirEditar(registro: HorarioRecord): void {
    this.editando.set(registro);
    this.errorMsg.set("");
    this.form.reset({ ...registro });
    this.modalAbierto.set(true);
  }

  cerrarModal(): void {
    this.modalAbierto.set(false);
  }

  async guardar(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.errorMsg.set("");
    const valor = this.form.getRawValue();

    try {
      const editando = this.editando();
      if (editando) {
        await this.horarioAdmin.actualizar(editando.id, valor);
      } else {
        await this.horarioAdmin.crear(valor);
      }
      this.modalAbierto.set(false);
    } catch {
      this.errorMsg.set("No se pudo guardar la clase. Intenta nuevamente.");
    } finally {
      this.guardando.set(false);
    }
  }

  async eliminar(registro: HorarioRecord): Promise<void> {
    const confirmado = confirm("¿Eliminar esta clase del horario? Esta acción no se puede deshacer.");
    if (!confirmado) return;
    await this.horarioAdmin.eliminar(registro.id);
  }
}
