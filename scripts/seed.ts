import { db } from '../src/db';
import { tenants, conversations, messages } from '../src/db/schema';

async function seed() {
  console.log('🌱 Insertando seed data...');

  const [tenant] = await db.insert(tenants).values({
    slug: 'la-trattoria',
    name: 'La Trattoria',
    clerkOrgId: 'org_test_demo',
    plan: 'active',
    settings: { language: 'es', tone: 'profesional' } as any,
  }).returning();
  console.log('  ✅ Tenant: ' + tenant.name);

  const [tenant2] = await db.insert(tenants).values({
    slug: 'sushi-bar',
    name: 'Sushi Bar Kyoto',
    clerkOrgId: 'org_test_demo_2',
    plan: 'trial',
    settings: { language: 'es', tone: 'casual' } as any,
  }).returning();
  console.log('  ✅ Tenant: ' + tenant2.name);

  const names = ['Carlos López', 'María García', 'Juan Pérez', 'Ana Martínez', 'Pedro Sánchez'];
  const msgs = [
    { role: 'user', content: 'Hola, quería hacer una reserva para 4 personas esta noche' },
    { role: 'assistant', content: '¡Claro! ¿A qué hora le gustaría venir? Tenemos mesas a las 21:00 y 21:30.' },
    { role: 'user', content: 'A las 21:30. ¿Tienen menú sin gluten?' },
    { role: 'assistant', content: 'Sí, tenemos opciones sin gluten. Le recomiendo nuestra pasta de arroz con pesto.' },
    { role: 'user', content: 'Perfecto, reserven para las 21:30' },
    { role: 'assistant', content: '✅ Reserva confirmada: 4 personas, hoy a las 21:30.' },
    { role: 'user', content: '¿Tienen aparcamiento?' },
    { role: 'assistant', content: 'Parking gratuito para clientes a 50m del local.' },
  ];

  let totalConv = 0;
  let totalMsg = 0;

  for (let i = 0; i < 5; i++) {
    const [conv] = await db.insert(conversations).values({
      tenantId: tenant.id,
      customerPhone: '+34600' + String(10000 + i).slice(1),
      customerName: names[i],
      status: i < 3 ? 'active' : 'closed',
    }).returning();
    totalConv++;

    const numMsgs = Math.min(msgs.length, 3 + Math.floor(Math.random() * 4));
    for (let j = 0; j < numMsgs; j++) {
      await db.insert(messages).values({
        conversationId: conv.id,
        role: msgs[j].role,
        content: msgs[j].content,
      });
      totalMsg++;
    }
  }

  // Mensajes de HOY para stats
  const today = new Date();
  for (const name of ['Helena Ruiz', 'David Gómez']) {
    const [conv] = await db.insert(conversations).values({
      tenantId: tenant.id,
      customerPhone: '+34611' + String(Math.floor(10000 + Math.random() * 89999)).slice(0, 5),
      customerName: name,
      status: 'active',
    }).returning();
    totalConv++;

    await db.insert(messages).values({
      conversationId: conv.id,
      role: 'user',
      content: 'Buenos días, ¿tienen mesa libre para mañana?',
      createdAt: today,
    });
    await db.insert(messages).values({
      conversationId: conv.id,
      role: 'assistant',
      content: '¡Sí! Tenemos disponibilidad. ¿Para cuántos comensales?',
      createdAt: today,
    });
    totalMsg += 2;
  }

  console.log('\n📊 Resumen:');
  console.log('  Tenants: 2');
  console.log('  Conversaciones: ' + totalConv);
  console.log('  Mensajes totales: ' + totalMsg);
  console.log('\n✨ Seed completado!');
}

seed().catch((e) => {
  console.error('❌ Error:', e.message);
  process.exit(1);
}).then(() => process.exit(0));
