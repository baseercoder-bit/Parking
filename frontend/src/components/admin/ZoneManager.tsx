import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, X, Loader2, ParkingCircle } from 'lucide-react';
import { zonesApi } from '../../services/api';
import type { Zone } from '../../services/api';

interface ZoneManagerProps {
  zones: Zone[];
  locationId: string;
  onZoneUpdate: (zones: Zone[]) => void;
}

export default function ZoneManager({ zones, locationId, onZoneUpdate }: ZoneManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', totalSpots: '' });

  const handleAddZone = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await zonesApi.create({
        name: formData.name,
        description: formData.description || undefined,
        totalSpots: parseInt(formData.totalSpots),
        locationId,
      });
      onZoneUpdate([...zones, response.data]);
      setFormData({ name: '', description: '', totalSpots: '' });
      setIsAdding(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create zone');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteZone = async (zoneId: string) => {
    if (!confirm('Are you sure you want to delete this zone?')) return;

    setLoading(true);
    setError(null);

    try {
      await zonesApi.delete(zoneId);
      onZoneUpdate(zones.filter(z => z.id !== zoneId));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete zone');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateZone = async (zoneId: string, name: string, description: string, totalSpots: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await zonesApi.update(zoneId, { name, description: description || undefined, totalSpots });
      onZoneUpdate(zones.map(z => z.id === zoneId ? response.data : z));
      setEditingId(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update zone');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Zones</h2>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsAdding(true)}
          disabled={isAdding}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
          style={{ backgroundColor: 'var(--primary-blue)', color: 'var(--white)' }}
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Add Zone</span>
          <span className="sm:hidden">Add</span>
        </motion.button>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600"
        >
          {error}
        </motion.div>
      )}

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-apple"
          >
            <form onSubmit={handleAddZone} className="space-y-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-semibold text-gray-900">Add New Zone</h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setFormData({ name: '', totalSpots: '' });
                    setError(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zone Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all duration-200 outline-none text-gray-900 placeholder-gray-400"
                  style={{ caretColor: '#111827' }}
                  placeholder="e.g., Zone A"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all duration-200 outline-none text-gray-900 placeholder-gray-400 resize-none"
                  style={{ caretColor: '#111827' }}
                  placeholder="e.g., Near main entrance, left side of building"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Spots
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.totalSpots}
                  onChange={(e) => setFormData({ ...formData, totalSpots: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all duration-200 outline-none text-gray-900 placeholder-gray-400"
                  style={{ caretColor: '#111827' }}
                  placeholder="e.g., 50"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gray-900 text-white py-3 rounded-xl font-semibold shadow-apple hover:shadow-apple-lg hover:bg-gray-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Zone'
                  )}
                </motion.button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setFormData({ name: '', description: '', totalSpots: '' });
                    setError(null);
                  }}
                  className="px-5 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {zones.length === 0 && !isAdding && (
        <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-200">
          <ParkingCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No zones yet. Click "Add Zone" to create one.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {zones.map((zone) => (
          <motion.div
            key={zone.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-white to-slate-50 border-2 border-slate-200 rounded-xl p-5 shadow-lg hover:shadow-xl transition-all hover:border-indigo-300"
          >
            {editingId === zone.id ? (
              <ZoneEditForm
                zone={zone}
                onSave={(name, description, totalSpots) => handleUpdateZone(zone.id, name, description, totalSpots)}
                onCancel={() => setEditingId(null)}
                loading={loading}
              />
            ) : (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-lg">{zone.name}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingId(zone.id)}
                      className="p-2 text-gray-600 hover:text-islamic-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteZone(zone.id)}
                      disabled={loading}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {zone.description && (
                  <div className="mb-3 text-sm text-gray-600 italic">
                    {zone.description}
                  </div>
                )}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Spots:</span>
                    <span className="font-semibold">{zone.totalSpots}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Occupied:</span>
                    <span className="font-semibold">{zone.occupiedSpots}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Available:</span>
                    <span className="font-semibold text-islamic-600">
                      {zone.totalSpots - zone.occupiedSpots}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ZoneEditForm({
  zone,
  onSave,
  onCancel,
  loading,
}: {
  zone: Zone;
  onSave: (name: string, description: string, totalSpots: number) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [name, setName] = useState(zone.name);
  const [description, setDescription] = useState(zone.description || '');
  const [totalSpots, setTotalSpots] = useState(zone.totalSpots.toString());

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const spots = parseInt(totalSpots);
    if (spots >= zone.occupiedSpots) {
      onSave(name, description, spots);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-islamic-500 focus:border-transparent outline-none"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Description <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-islamic-500 focus:border-transparent outline-none resize-none"
          placeholder="e.g., Near main entrance, left side"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Total Spots</label>
        <input
          type="number"
          min={zone.occupiedSpots}
          value={totalSpots}
          onChange={(e) => setTotalSpots(e.target.value)}
          required
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-islamic-500 focus:border-transparent outline-none"
        />
        {parseInt(totalSpots) < zone.occupiedSpots && (
          <p className="text-xs text-red-600 mt-1">
            Must be at least {zone.occupiedSpots} (current occupied)
          </p>
        )}
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading || parseInt(totalSpots) < zone.occupiedSpots}
          className="flex-1 px-3 py-2 bg-islamic-600 text-white text-sm rounded-lg hover:bg-islamic-700 transition-colors disabled:opacity-50"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

