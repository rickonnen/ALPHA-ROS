import { isValidEmail, getSuspiciousDomainSuggestion } from './utils';

/**
 * Pruebas para la función isValidEmail
 */
console.log('========== PRUEBAS DE VALIDACIÓN DE EMAIL ==========\n');

// Casos válidos
const validEmails = [
  'usuario@example.com',
  'user.name@example.co.uk',
  'user+tag@example.com',
  'user_name@example.com',
  'user123@example.com',
  'juan@gmail.com',
  'maria@yahoo.com',
  'contact@company.org',
];

console.log('✓ Correos VÁLIDOS (deberían pasar):');
validEmails.forEach((email) => {
  const result = isValidEmail(email);
  console.log(`  ${result ? '✓' : '✗'} ${email}`);
});

console.log('\n');

// Casos inválidos
const invalidEmails = [
  'gmil.com',  // Sin @
  'usuario@gmil.com',  // Dominio con typo (pero valida el formato)
  'usuario@',  // Sin dominio
  '@example.com',  // Sin parte local
  'usuario@example',  // Sin extensión
  'usuario@@example.com',  // Doble @
  'usuario..name@example.com',  // Puntos consecutivos en la parte local
  '.usuario@example.com',  // Comienza con punto
  'usuario.@example.com',  // Termina con punto
  'usuario@.example.com',  // Dominio comienza con punto
  'usuario@example..com',  // Puntos consecutivos en dominio
  'usuario@example.c',  // TLD muy corto
  'usuario@example.123',  // TLD con números
  'usuario name@example.com',  // Espacio en la parte local
  'usuario@exam ple.com',  // Espacio en el dominio
];

console.log('✗ Correos INVÁLIDOS (deberían fallar):');
invalidEmails.forEach((email) => {
  const result = isValidEmail(email);
  console.log(`  ${!result ? '✓' : '✗'} ${email} (${result ? 'ERROR: pasó validación' : 'correctamente rechazado'})`);
});

console.log('\n========== PRUEBAS DE DETECCIÓN DE TYPOS ==========\n');

// Casos con typos sugeridos
const typoEmails = [
  'usuario@gmil.com',
  'usuario@gmai.com',
  'usuario@yahooo.com',
  'usuario@hotmial.com',
  'usuario@outloo.com',
];

console.log('Dominios sospechosos (deberían sugerir alternativas):');
typoEmails.forEach((email) => {
  const suggestion = getSuspiciousDomainSuggestion(email);
  console.log(`  ${email} → ${suggestion ? `Sugerir: ${suggestion}` : 'Sin sugerencia'}`);
});

console.log('\n========== PRUEBAS COMPLETADAS ==========');
