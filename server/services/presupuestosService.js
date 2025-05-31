const supabase = require("../config/supabaseClient");

class PresupuestosService {
  /**
   * Actualiza el progreso de presupuestos cuando se crea/modifica una transacción
   */
  static async actualizarProgresoPresupuestos(
    transaccion,
    esRectificacion = false
  ) {
    try {
      // Solo procesar gastos (excepto transferencias que son categoría 6)
      if (transaccion.tipo !== "gasto" || transaccion.categoria_id === 6) {
        if (!esRectificacion) {
          return;
        }
      }

      let fechaAUsar = transaccion.fecha;
      let categoriaAUsar = transaccion.categoria_id;

      // Si tiene transaccion_original_id, obtener la fecha de la transacción original
      if (transaccion.transaccion_original_id) {
        console.log("Procesando rectificación:", transaccion.id);

        const { data: transaccionOriginal, error: errorOriginal } =
          await supabase
            .from("transacciones")
            .select("fecha, categoria_id, tipo")
            .eq("id", transaccion.transaccion_original_id)
            .single();

        if (errorOriginal || !transaccionOriginal) {
          console.error(
            "Error al obtener transacción original:",
            errorOriginal
          );
          return;
        }

        // Solo procesar si la transacción original era un gasto
        if (transaccionOriginal.tipo !== "gasto") {
          return;
        }

        // Usar la fecha y categoría de la transacción original
        fechaAUsar = transaccionOriginal.fecha;
        categoriaAUsar = transaccionOriginal.categoria_id;
      }

      // Buscar presupuestos activos para esta categoría y usuario
      const { data: presupuestos, error } = await supabase
        .from("presupuestos")
        .select("*")
        .eq("categoria_id", categoriaAUsar)
        .eq("user_id", transaccion.user_id)
        .eq("estado", true);

      if (error) {
        console.error("Error al buscar presupuestos:", error);
        return;
      }

      // Procesar cada presupuesto que coincida
      for (const presupuesto of presupuestos) {
        // Verificar que la fecha esté en el rango del presupuesto
        if (
          this.estaEnRangoFechas(
            fechaAUsar,
            presupuesto.fecha_inicio,
            presupuesto.fecha_fin
          )
        ) {
          // Determinar si sumar o restar
          const monto = esRectificacion
            ? -Math.abs(transaccion.monto)
            : Math.abs(transaccion.monto);
          await this.recalcularProgreso(presupuesto.id, monto);
        }
      }
    } catch (error) {
      console.error("Error en actualizarProgresoPresupuestos:", error);
    }
  }

  /**
   * Normaliza una fecha para comparación (solo día, mes, año)
   */
  static normalizarFecha(fecha) {
    const fechaNormalizada = new Date(fecha);
    fechaNormalizada.setHours(0, 0, 0, 0);
    return fechaNormalizada;
  }

  /**
   * Verifica si una fecha está dentro de un rango (solo considera día, mes, año)
   */
  static estaEnRangoFechas(fecha, fechaInicio, fechaFin) {
    const fechaNorm = this.normalizarFecha(fecha);
    const inicioNorm = this.normalizarFecha(fechaInicio);
    const finNorm = this.normalizarFecha(fechaFin);

    return fechaNorm >= inicioNorm && fechaNorm <= finNorm;
  }

  /**
   * Actualiza el progreso de un presupuesto sumando o restando un monto
   */
  static async recalcularProgreso(presupuestoId, monto) {
    try {
      // Obtener el progreso actual
      const { data: presupuesto, error: errorPresupuesto } = await supabase
        .from("presupuestos")
        .select("progreso")
        .eq("id", presupuestoId)
        .single();

      if (errorPresupuesto || !presupuesto) {
        console.error("Error al obtener presupuesto:", errorPresupuesto);
        return;
      }

      const nuevoProgreso = Math.max(0, presupuesto.progreso + monto);

      // Actualizar el progreso
      const { error: errorActualizar } = await supabase
        .from("presupuestos")
        .update({ progreso: nuevoProgreso })
        .eq("id", presupuestoId);

      if (errorActualizar) {
        console.error(
          "Error al actualizar progreso del presupuesto:",
          errorActualizar
        );
      } else {
        console.log(
          `Progreso actualizado. Monto: ${monto}, Nuevo progreso: ${nuevoProgreso}`
        );
      }
    } catch (error) {
      console.error("Error en actualizarProgresoPresupuesto:", error);
    }
  }
}

module.exports = PresupuestosService;
