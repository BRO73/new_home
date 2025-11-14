import { useState,useEffect, useCallback } from 'react';
import { Box, Container, Typography } from '@mui/material';
import BookingForm from '@/components/BookingForm';
import { FloorViewer } from '@/components/FloorViewer';
import { useLocations } from '@/hooks/useLocations';
import { useFloorElements } from '@/hooks/useFloorElements';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {TableResponse} from "@/types";
import {useTables} from "@/hooks/useTables.ts";
import {useBooking} from '@/hooks/useBooking';
import ChatBot from '@/components/ChatBot';

const BookingPage = () => {
  const [currentTables, setCurrentTables] = useState<TableResponse[]>([]);
  const { locations } = useLocations();
  const { data: elements = [] } = useFloorElements();
  const [selectedFloor, setSelectedFloor] = useState<string>('');
  const { tables, loading, error } = useTables();
  const{ addBooking } = useBooking();
  // Set floor mặc định khi load xong
  useEffect(() => {
    if (locations.length > 0 && !selectedFloor) {
      setSelectedFloor(locations[0].name);
    }
  }, [locations, selectedFloor]);

  const handleSelectTables = useCallback((selectedTables: TableResponse[]) => {
    setCurrentTables(selectedTables);
  }, []);

  if (loading) {
    return (
        <Box sx={{ my: 6, py: 6, minHeight: 'calc(100vh - 400px)' }}>
          <Container maxWidth="lg">
            <div className="flex items-center justify-center h-64">
              <p className="text-lg text-gray-500">Loading...</p>
            </div>
          </Container>
        </Box>
    );
  }

  return (
      <div>
        <Box sx={{ my: 6, py: 6, minHeight: 'calc(100vh - 400px)' }}>
          <Container maxWidth="lg">
            {/* Header Section */}
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Typography variant="h2" className="font-serif font-bold mb-3" sx={{ color: 'hsl(var(--primary))' }}>
                Reserve Your Table
              </Typography>
              <Typography variant="h6" sx={{ color: 'hsl(var(--muted-foreground))', fontWeight: 300, mb: 2 }}>
                Book your dining experience today
              </Typography>
              <Typography variant="body1" sx={{ maxWidth: 600, mx: 'auto', color: 'hsl(var(--muted-foreground))' }}>
                We look forward to serving you. Please fill out the form below to make a reservation.
                We'll confirm your booking via email shortly.
              </Typography>
            </Box>

            {/* Floor Selection & View Section */}
            <Box sx={{ mb: 6 }}>
              <Typography variant="h4" sx={{ mb: 3, fontWeight: 600, color: 'hsl(var(--foreground))' }}>
                Select Your Floor
              </Typography>

              <Tabs value={selectedFloor} onValueChange={setSelectedFloor} className="w-full">
                <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${locations.length}, minmax(0, 1fr))` }}>
                  {locations.map((location) => (
                      <TabsTrigger key={location.id} value={location.name}>
                        {location.name}
                      </TabsTrigger>
                  ))}
                </TabsList>

                {locations.map((location) => (
                    <TabsContent key={location.id} value={location.name} className="mt-6">

                      ...
                      <FloorViewer
                          tables={tables}
                          floor={location.name}
                          elements={elements.filter(el => el.floor === location.name)}
                          onSelectTables={handleSelectTables}
                      />

                    </TabsContent>
                ))}
              </Tabs>
            </Box>

            {/* Booking Form Section */}
            <Box>
              <Typography variant="h4" sx={{ mb: 3, fontWeight: 600, color: 'hsl(var(--foreground))' }}>
                Reservation Details
              </Typography>
              <BookingForm
                  selectedTables={currentTables}
                  onSelectedTablesChange={(tables) => setCurrentTables(tables)}
              />
            </Box>
          </Container>
        </Box>
        <ChatBot />
      </div>
  );
};

export default BookingPage;