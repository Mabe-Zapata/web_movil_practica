import { Component, inject } from "@angular/core";
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from "@angular/router";
import { filter, map, startWith } from "rxjs";
import { toSignal } from "@angular/core/rxjs-interop";
import { AuthService } from "../../core/services/auth.service";

interface RouteHeaderData {
  breadcrumb: string;
  title: string;
}

@Component({
  selector: "app-layout",
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: "./layout.component.html",
})
export class LayoutComponent {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  /**
   * Lee { breadcrumb, title } de la ruta hija activa para el header.
   * Camina el árbol de SNAPSHOTS (no el árbol "vivo" de ActivatedRoute) para
   * evitar errores de sincronización durante la navegación entre pantallas.
   */
  protected readonly header = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      startWith(null),
      map((): RouteHeaderData => {
        let snapshot = this.router.routerState.snapshot.root;
        while (snapshot.firstChild) snapshot = snapshot.firstChild;
        const data = snapshot.data as Partial<RouteHeaderData>;
        return {
          breadcrumb: data.breadcrumb ?? "",
          title: data.title ?? "",
        };
      })
    ),
    { initialValue: { breadcrumb: "", title: "" } }
  );

  onLogout(): void {
    this.auth.logout();
    this.router.navigate(["/login"]);
  }
}
