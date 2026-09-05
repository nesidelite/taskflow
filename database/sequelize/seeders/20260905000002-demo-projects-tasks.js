'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    await queryInterface.bulkInsert('projects', [
      {
        id: 1,
        title: 'Rediseño Web Corporativa',
        description: 'Actualización de la interfaz y experiencia de usuario para la plataforma comercial.',
        color: '#3B82F6',
        created_at: now,
        updated_at: now,
      },
      {
        id: 2,
        title: 'Infraestructura Cloud & DevOps',
        description: 'Migración a Docker Compose y configuración de pipelines CI/CD para producción.',
        color: '#10B981',
        created_at: now,
        updated_at: now,
      },
    ], {});

    const today = new Date();
    const addDays = (d, days) => {
      const copy = new Date(d);
      copy.setDate(copy.getDate() + days);
      return copy.toISOString().split('T')[0];
    };

    await queryInterface.bulkInsert('tasks', [
      {
        id: 1,
        title: 'Diseñar wireframes en Figma',
        description: 'Elaborar componentes de alta fidelidad y guías de estilos con componentes shadcn/ui.',
        status: 'COMPLETED',
        priority: 'HIGH',
        due_date: addDays(today, -2),
        project_id: 1,
        created_at: now,
        updated_at: now,
      },
      {
        id: 2,
        title: 'Maquetar landing page con Next.js',
        description: 'Implementar vistas con App Router y componentes interactivos consumiendo FastAPI.',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        due_date: addDays(today, 4),
        project_id: 1,
        created_at: now,
        updated_at: now,
      },
      {
        id: 3,
        title: 'Pruebas de usabilidad responsive',
        description: 'Validar visualización en dispositivos móviles y tabletas con modo oscuro/claro.',
        status: 'PENDING',
        priority: 'LOW',
        due_date: addDays(today, 10),
        project_id: 1,
        created_at: now,
        updated_at: now,
      },
      {
        id: 4,
        title: 'Configurar contenedores Docker y Compose',
        description: 'Escribir Dockerfiles multi-stage y orquestación con healthcheck para MySQL 8.0.',
        status: 'COMPLETED',
        priority: 'HIGH',
        due_date: addDays(today, -1),
        project_id: 2,
        created_at: now,
        updated_at: now,
      },
      {
        id: 5,
        title: 'Automatizar migraciones y healthchecks en VPS',
        description: 'Preparar scripts de despliegue continuo y comprobación de base de datos MySQL en producción.',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        due_date: addDays(today, 3),
        project_id: 2,
        created_at: now,
        updated_at: now,
      },
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('tasks', null, {});
    await queryInterface.bulkDelete('projects', null, {});
  },
};
