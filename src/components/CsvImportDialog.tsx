import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabaseService } from '@/services/supabaseService';

interface CsvRow {
  date: string;
  camper_name: string;
  camper_id: string;
  missions: string[];
  valid: boolean;
  error?: string;
}

interface CsvImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

const CsvImportDialog: React.FC<CsvImportDialogProps> = ({ isOpen, onClose, onImportComplete }) => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [parsedData, setParsedData] = useState<CsvRow[]>([]);
  const [camperProfiles, setCamperProfiles] = useState<any[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setParsedData([]);
    } else {
      toast({
        title: "Invalid File",
        description: "Please select a CSV file.",
        variant: "destructive"
      });
    }
  };

  const parseCSV = async () => {
    if (!file) return;

    setParsing(true);
    try {
      // Load camper profiles for validation
      const profiles = await supabaseService.getAllCamperProfiles();
      setCamperProfiles(profiles);

      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      // Expected headers: date, camper_name, camper_id, missions
      const requiredHeaders = ['date', 'camper_name', 'camper_id', 'missions'];
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      
      if (missingHeaders.length > 0) {
        toast({
          title: "Invalid CSV Format",
          description: `Missing required columns: ${missingHeaders.join(', ')}`,
          variant: "destructive"
        });
        setParsing(false);
        return;
      }

      const parsed: CsvRow[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const values = line.split(',').map(v => v.trim());
        const row: any = {};
        
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });

        // Validate and parse the row
        const csvRow: CsvRow = {
          date: row.date,
          camper_name: row.camper_name,
          camper_id: row.camper_id,
          missions: row.missions ? row.missions.split(';').map((m: string) => m.trim()).filter((m: string) => m) : [],
          valid: true
        };

        // Validation
        if (!csvRow.date || isNaN(Date.parse(csvRow.date))) {
          csvRow.valid = false;
          csvRow.error = 'Invalid date format';
        } else if (!csvRow.camper_name) {
          csvRow.valid = false;
          csvRow.error = 'Missing camper name';
        } else if (!csvRow.camper_id) {
          csvRow.valid = false;
          csvRow.error = 'Missing camper ID';
        } else if (csvRow.missions.length === 0) {
          csvRow.valid = false;
          csvRow.error = 'No missions specified';
        } else {
          // Check if camper exists
          const camperExists = profiles.some(p => p.id === csvRow.camper_id || p.name === csvRow.camper_name);
          if (!camperExists) {
            csvRow.valid = false;
            csvRow.error = 'Camper not found in system';
          }
        }

        parsed.push(csvRow);
      }

      setParsedData(parsed);
      
      const validCount = parsed.filter(r => r.valid).length;
      const invalidCount = parsed.filter(r => !r.valid).length;
      
      toast({
        title: "CSV Parsed",
        description: `Found ${validCount} valid rows and ${invalidCount} invalid rows.`,
      });
      
    } catch (error) {
      console.error('Error parsing CSV:', error);
      toast({
        title: "Parse Error",
        description: "Failed to parse CSV file. Please check the format.",
        variant: "destructive"
      });
    } finally {
      setParsing(false);
    }
  };

  const importData = async () => {
    const validRows = parsedData.filter(r => r.valid);
    if (validRows.length === 0) {
      toast({
        title: "No Valid Data",
        description: "No valid rows to import.",
        variant: "destructive"
      });
      return;
    }

    setImporting(true);
    try {
      let successCount = 0;
      let errorCount = 0;

      for (const row of validRows) {
        try {
          // Find camper by ID or name
          let camper = camperProfiles.find(p => p.id === row.camper_id);
          if (!camper) {
            camper = camperProfiles.find(p => p.name === row.camper_name);
          }

          if (camper) {
            // Import the submission
            // Use submitCamperMissions method directly - it handles the Supabase insert
            await supabaseService.submitCamperMissions(camper.id, row.missions);
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          console.error('Error importing row:', error);
          errorCount++;
        }
      }

      toast({
        title: "Import Complete",
        description: `Successfully imported ${successCount} submissions. ${errorCount} errors.`,
      });

      if (successCount > 0) {
        onImportComplete();
        onClose();
      }
    } catch (error) {
      console.error('Error importing data:', error);
      toast({
        title: "Import Error",
        description: "Failed to import data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setImporting(false);
    }
  };

  const reset = () => {
    setFile(null);
    setParsedData([]);
    setCamperProfiles([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Import Submissions from CSV</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Upload */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select CSV File
                  </label>
                  <Input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                </div>
                
                <div className="text-sm text-gray-600">
                  <p className="font-medium mb-1">Required CSV format:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li><strong>date</strong> - Date in YYYY-MM-DD format</li>
                    <li><strong>camper_name</strong> - Full name of the camper</li>
                    <li><strong>camper_id</strong> - Camper ID (optional if name is provided)</li>
                    <li><strong>missions</strong> - Mission IDs separated by semicolons (e.g., "mission1;mission2;mission3")</li>
                  </ul>
                </div>

                {file && (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">File selected: {file.name}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Parse Button */}
          {file && parsedData.length === 0 && (
            <div className="text-center">
              <Button 
                onClick={parseCSV} 
                disabled={parsing}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {parsing ? 'Parsing...' : 'Parse CSV'}
              </Button>
            </div>
          )}

          {/* Preview Data */}
          {parsedData.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Preview Data</h3>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={reset}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </div>
                
                <div className="max-h-60 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Status</th>
                        <th className="text-left p-2">Date</th>
                        <th className="text-left p-2">Camper</th>
                        <th className="text-left p-2">Missions</th>
                        <th className="text-left p-2">Error</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedData.map((row, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">
                            {row.valid ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-red-600" />
                            )}
                          </td>
                          <td className="p-2">{row.date}</td>
                          <td className="p-2">{row.camper_name}</td>
                          <td className="p-2">{row.missions.length} missions</td>
                          <td className="p-2 text-red-600 text-xs">{row.error || ''}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Valid: {parsedData.filter(r => r.valid).length} | 
                    Invalid: {parsedData.filter(r => !r.valid).length}
                  </div>
                  
                  <Button 
                    onClick={importData}
                    disabled={importing || parsedData.filter(r => r.valid).length === 0}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {importing ? 'Importing...' : `Import ${parsedData.filter(r => r.valid).length} Submissions`}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CsvImportDialog;