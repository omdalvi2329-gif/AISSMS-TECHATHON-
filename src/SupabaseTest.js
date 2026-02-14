import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

const SupabaseTest = () => {
  const [status, setStatus] = useState('Testing connection...');

  useEffect(() => {
    async function testConnection() {
      try {
        // This just attempts to fetch any table list or simple data
        const { data, error } = await supabase.from('_test_connection').select('*').limit(1);
        
        // PGRST205 or 404 means we successfully REACHED the Supabase schema cache.
        if (error) {
          if (error.code === 'PGRST205' || error.code === '42P01' || error.status === 404) {
            setStatus('✅ Successfully connected to Supabase!');
            return;
          }
          throw error;
        }
      } catch (error) {
        console.error('Supabase connection error:', error);
        setStatus('❌ Connection failed. Check console and .env file.');
      }
    }

    testConnection();
  }, []);

  return (
    <div style={{ padding: '20px', margin: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h3>Supabase Status</h3>
      <p>{status}</p>
    </div>
  );
};

export default SupabaseTest;
