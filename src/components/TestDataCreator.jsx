import React, { useState } from 'react';
import Button from './ui/Button';
import { createTestData } from '../utils/createTestData';

const TestDataCreator = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleCreateTestData = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await createTestData();
      setResult(response);
    } catch (error) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card p-6 rounded-lg border border-border">
      <h3 className="text-lg font-semibold mb-4">Test Data Creator</h3>
      <p className="text-muted-foreground mb-4">
        Bu araç Firestore'da test verisi oluşturur. Leaderboard verilerini test etmek için kullanın.
      </p>

      <Button
        onClick={handleCreateTestData}
        loading={loading}
        className="mb-4"
      >
        Test Verisi Oluştur
      </Button>

      {result && (
        <div className={`p-4 rounded-md ${result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {result.success ? result.message : `Hata: ${result.error}`}
        </div>
      )}
    </div>
  );
};

export default TestDataCreator;