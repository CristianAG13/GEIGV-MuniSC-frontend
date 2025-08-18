// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../contexts/AuthContext';
// import { useData } from '../contexts/DataContext';
// import { machineryService, Machinery } from '../services/machineryService';

// export default function NewFieldReport() {
//   const navigate = useNavigate();
//   const { user } = useAuth();
//   const { addFieldReport } = useData();

//   const [machinery, setMachinery] = useState<Machinery[]>([]);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState('');

//   // Campos del formulario
//   const [route, setRoute] = useState('');
//   const [workType, setWorkType] = useState('');
//   const [startTime, setStartTime] = useState<string>(() => new Date().toISOString().slice(0,16));
//   const [endTime, setEndTime] = useState<string>('');
//   const [observations, setObservations] = useState('');
//   const [machineryId, setMachineryId] = useState<string>('');
//   const [locationLat, setLocationLat] = useState<number | ''>('');
//   const [locationLng, setLocationLng] = useState<number | ''>('');
//   const [materials, setMaterials] = useState<Array<{name:string;quantity:number;unit:string}>>([]);

//   useEffect(() => {
//     machineryService.getAll().then(setMachinery).catch(() => setMachinery([]));
//   }, []);

//   const addMaterial = () => setMaterials(prev => [...prev, {name:'', quantity:1, unit:'kg'}]);
//   const updateMaterial = (i:number, key:'name'|'quantity'|'unit', val:any) =>
//     setMaterials(prev => prev.map((m,idx) => idx===i ? {...m,[key]: val} : m));
//   const removeMaterial = (i:number) =>
//     setMaterials(prev => prev.filter((_,idx)=>idx!==i));

//   const onSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');
//     if (!user) return setError('Sesión inválida');
//     if (!machineryId) return setError('Selecciona una maquinaria');
//     if (!route || !workType || !startTime) return setError('Completa los campos obligatorios');

//     try {
//       setSaving(true);
//       await addFieldReport({
//   driverName: user!.name,
//   machineryName: '',
//   route,
//   workType,
//   startTime,
//   endTime: endTime || undefined,
//   materialsUsed: materials,
//   observations,
//   status: 'pendiente',
//   images: [],
//   location: { lat: typeof locationLat === 'number' ? locationLat : 0,
//               lng: typeof locationLng === 'number' ? locationLng : 0 },
//   driverId: user!.id,
//   machineryId,
//   reviewedBy: undefined,
//   reviewDate: undefined,
//   reviewComments: undefined
// });

//       navigate('/dashboard/reports');
//     } catch (err:any) {
//       setError('No se pudo crear el reporte');
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6">
//       <h1 className="text-xl font-semibold mb-4">Nuevo Reporte de Campo</h1>

//       {error && <div className="mb-4 text-red-600">{error}</div>}

//       <form className="space-y-4" onSubmit={onSubmit}>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Ruta *</label>
//             <input value={route} onChange={e=>setRoute(e.target.value)} className="w-full border p-2 rounded" required />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Tipo de trabajo *</label>
//             <input value={workType} onChange={e=>setWorkType(e.target.value)} className="w-full border p-2 rounded" required />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Inicio *</label>
//             <input type="datetime-local" value={startTime} onChange={e=>setStartTime(e.target.value)} className="w-full border p-2 rounded" required />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Fin</label>
//             <input type="datetime-local" value={endTime} onChange={e=>setEndTime(e.target.value)} className="w-full border p-2 rounded" />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700">Maquinaria *</label>
//             <select value={machineryId} onChange={e=>setMachineryId(e.target.value)} className="w-full border p-2 rounded" required>
//               <option value="">Seleccione…</option>
//               {machinery.map(m => (
//                 <option key={m.id} value={m.id}>{m.name} ({m.plate})</option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700">Observaciones</label>
//             <input value={observations} onChange={e=>setObservations(e.target.value)} className="w-full border p-2 rounded" />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700">Latitud</label>
//             <input type="number" step="any" value={locationLat} onChange={e=>setLocationLat(e.target.value === '' ? '' : Number(e.target.value))} className="w-full border p-2 rounded" />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Longitud</label>
//             <input type="number" step="any" value={locationLng} onChange={e=>setLocationLng(e.target.value === '' ? '' : Number(e.target.value))} className="w-full border p-2 rounded" />
//           </div>
//         </div>

//         <div>
//           <div className="flex items-center justify-between mb-2">
//             <label className="text-sm font-medium text-gray-700">Materiales</label>
//             <button type="button" onClick={addMaterial} className="text-blue-600 text-sm">+ Agregar</button>
//           </div>
//           {materials.length === 0 && <p className="text-sm text-gray-500">No has agregado materiales.</p>}
//           <div className="space-y-2">
//             {materials.map((m, i) => (
//               <div key={i} className="grid grid-cols-12 gap-2">
//                 <input className="col-span-6 border p-2 rounded" placeholder="Nombre"
//                   value={m.name} onChange={e=>updateMaterial(i,'name',e.target.value)} />
//                 <input type="number" className="col-span-3 border p-2 rounded" placeholder="Cantidad"
//                   value={m.quantity} onChange={e=>updateMaterial(i,'quantity',Number(e.target.value))} />
//                 <input className="col-span-2 border p-2 rounded" placeholder="Unidad"
//                   value={m.unit} onChange={e=>updateMaterial(i,'unit',e.target.value)} />
//                 <button type="button" className="col-span-1 text-red-600" onClick={()=>removeMaterial(i)}>X</button>
//               </div>
//             ))}
//           </div>
//         </div>

//         <div className="flex gap-2">
//           <button disabled={saving} className="bg-blue-600 text-white px-4 py-2 rounded">
//             {saving ? 'Guardando…' : 'Guardar'}
//           </button>
//           <button type="button" onClick={()=>navigate('/dashboard/reports')} className="px-4 py-2 rounded border">
//             Cancelar
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { machineryService, Machinery } from '../services/machineryService';

export default function NewFieldReport() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addFieldReport } = useData();

  const [machinery, setMachinery] = useState<Machinery[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Campos del formulario
  const [route, setRoute] = useState('');
  const [workType, setWorkType] = useState('');
  const [startTime, setStartTime] = useState<string>(() => new Date().toISOString().slice(0,16));
  const [endTime, setEndTime] = useState<string>('');
  const [observations, setObservations] = useState('');
  const [machineryId, setMachineryId] = useState<string>('');
  const [locationLat, setLocationLat] = useState<number | ''>('');
  const [locationLng, setLocationLng] = useState<number | ''>('');
  const [materials, setMaterials] = useState<Array<{name:string;quantity:number;unit:string}>>([]);

  useEffect(() => {
    machineryService.getAll().then(setMachinery).catch(() => setMachinery([]));
  }, []);

  const addMaterial = () => setMaterials(prev => [...prev, {name:'', quantity:1, unit:'kg'}]);
  const updateMaterial = (i:number, key:'name'|'quantity'|'unit', val:any) =>
    setMaterials(prev => prev.map((m,idx) => idx===i ? {...m,[key]: val} : m));
  const removeMaterial = (i:number) =>
    setMaterials(prev => prev.filter((_,idx)=>idx!==i));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!user) return setError('Sesión inválida');
    if (!machineryId) return setError('Selecciona una maquinaria');
    if (!route || !workType || !startTime) return setError('Completa los campos obligatorios');

    try {
      setSaving(true);
      await addFieldReport({
  driverName: user!.name,
  machineryName: '',
  route,
  workType,
  startTime,
  endTime: endTime || undefined,
  materialsUsed: materials,
  observations,
  status: 'pendiente',
  images: [],
  location: { lat: typeof locationLat === 'number' ? locationLat : 0,
              lng: typeof locationLng === 'number' ? locationLng : 0 },
  driverId: user!.id,
  machineryId,
  reviewedBy: undefined,
  reviewDate: undefined,
  reviewComments: undefined
});

      navigate('/dashboard/reports');
    } catch (err:any) {
      setError('No se pudo crear el reporte');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6">
      <h1 className="text-xl font-semibold mb-4">Nuevo Reporte de Campo</h1>

      {error && <div className="mb-4 text-red-600">{error}</div>}

      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Ruta *</label>
            <input value={route} onChange={e=>setRoute(e.target.value)} className="w-full border p-2 rounded" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tipo de trabajo *</label>
            <input value={workType} onChange={e=>setWorkType(e.target.value)} className="w-full border p-2 rounded" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Inicio *</label>
            <input type="datetime-local" value={startTime} onChange={e=>setStartTime(e.target.value)} className="w-full border p-2 rounded" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Fin</label>
            <input type="datetime-local" value={endTime} onChange={e=>setEndTime(e.target.value)} className="w-full border p-2 rounded" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Maquinaria *</label>
            <select value={machineryId} onChange={e=>setMachineryId(e.target.value)} className="w-full border p-2 rounded" required>
              <option value="">Seleccione…</option>
              {machinery.map(m => (
                <option key={m.id} value={m.id}>{m.name} ({m.plate})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Observaciones</label>
            <input value={observations} onChange={e=>setObservations(e.target.value)} className="w-full border p-2 rounded" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Latitud</label>
            <input type="number" step="any" value={locationLat} onChange={e=>setLocationLat(e.target.value === '' ? '' : Number(e.target.value))} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Longitud</label>
            <input type="number" step="any" value={locationLng} onChange={e=>setLocationLng(e.target.value === '' ? '' : Number(e.target.value))} className="w-full border p-2 rounded" />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Materiales</label>
            <button type="button" onClick={addMaterial} className="text-blue-600 text-sm">+ Agregar</button>
          </div>
          {materials.length === 0 && <p className="text-sm text-gray-500">No has agregado materiales.</p>}
          <div className="space-y-2">
            {materials.map((m, i) => (
              <div key={i} className="grid grid-cols-12 gap-2">
                <input className="col-span-6 border p-2 rounded" placeholder="Nombre"
                  value={m.name} onChange={e=>updateMaterial(i,'name',e.target.value)} />
                <input type="number" className="col-span-3 border p-2 rounded" placeholder="Cantidad"
                  value={m.quantity} onChange={e=>updateMaterial(i,'quantity',Number(e.target.value))} />
                <input className="col-span-2 border p-2 rounded" placeholder="Unidad"
                  value={m.unit} onChange={e=>updateMaterial(i,'unit',e.target.value)} />
                <button type="button" className="col-span-1 text-red-600" onClick={()=>removeMaterial(i)}>X</button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <button disabled={saving} className="bg-blue-600 text-white px-4 py-2 rounded">
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
          <button type="button" onClick={()=>navigate('/dashboard/reports')} className="px-4 py-2 rounded border">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
