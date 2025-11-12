/**
 * Script de depuración para diagnosticar problemas con el usuario actual
 * 
 * INSTRUCCIONES:
 * 1. Abre la consola del navegador (F12)
 * 2. Copia y pega TODO este código
 * 3. Presiona Enter
 * 4. Comparte los resultados
 */

console.log('═'.repeat(60));
console.log('🔍 DIAGNÓSTICO DE USUARIO ACTUAL');
console.log('═'.repeat(60));

// 1. Verificar localStorage
console.log('\n📦 1. Datos en localStorage:');
console.log('───────────────────────────────');
const token = localStorage.getItem('access_token');
const userStr = localStorage.getItem('user');

console.log('Token existe:', !!token);
if (token) {
  console.log('Token (primeros 50 chars):', token.substring(0, 50) + '...');
}

console.log('\nUsuario en localStorage:', userStr ? 'SÍ' : 'NO');
if (userStr) {
  try {
    const user = JSON.parse(userStr);
    console.log('Usuario parseado:', user);
    console.log('  - ID:', user.id);
    console.log('  - Name:', user.name);
    console.log('  - Lastname:', user.lastname || user.last);
    console.log('  - Email:', user.email);
    console.log('  - Roles:', user.roles);
  } catch (e) {
    console.error('❌ Error al parsear usuario:', e);
  }
}

// 2. Probar endpoint /users/me
console.log('\n🌐 2. Probando GET /users/me:');
console.log('───────────────────────────────');

if (token) {
  fetch('http://localhost:3000/users/me', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
    .then(response => {
      console.log('Status:', response.status);
      console.log('Status Text:', response.statusText);
      return response.json();
    })
    .then(data => {
      console.log('✅ Respuesta exitosa:');
      console.log(data);
      console.log('\n📋 Datos del usuario:');
      console.log('  - ID:', data.id);
      console.log('  - Name:', data.name);
      console.log('  - Lastname:', data.lastname);
      console.log('  - Email:', data.email);
      console.log('  - Roles:', data.roles);
    })
    .catch(error => {
      console.error('❌ Error al llamar /users/me:', error);
    });
} else {
  console.warn('⚠️ No hay token, no se puede llamar a /users/me');
}

// 3. Verificar roles
console.log('\n🎭 3. Verificación de roles:');
console.log('───────────────────────────────');
if (userStr) {
  try {
    const user = JSON.parse(userStr);
    const roles = user.roles || [];
    
    console.log('Roles encontrados:', roles);
    console.log('Cantidad de roles:', roles.length);
    
    roles.forEach((role, i) => {
      console.log(`  ${i + 1}. Tipo: ${typeof role}, Valor:`, role);
      
      if (typeof role === 'string') {
        console.log(`     -> Es string: "${role}"`);
      } else if (role && typeof role === 'object') {
        console.log(`     -> Es objeto: name="${role.name}"`);
      }
    });
    
    const isSuperAdmin = roles.some(role => {
      const roleName = typeof role === 'string' ? role : role?.name;
      return roleName?.toLowerCase() === 'superadmin';
    });
    
    console.log('\n🎯 Es SuperAdmin:', isSuperAdmin);
    console.log('   Debe mostrar:', isSuperAdmin ? 'TODOS los operadores' : 'SOLO su propio nombre');
    
  } catch (e) {
    console.error('❌ Error al analizar roles:', e);
  }
}

console.log('\n═'.repeat(60));
console.log('✅ Diagnóstico completado');
console.log('Por favor, comparte TODA esta salida de consola');
console.log('═'.repeat(60));
