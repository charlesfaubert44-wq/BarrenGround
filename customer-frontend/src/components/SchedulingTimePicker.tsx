import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

interface TimeSlot {
  time: string;
  datetime: string;
  available: boolean;
  ordersCount: number;
  maxOrders: number;
}

interface SchedulingTimePickerProps {
  onTimeSelect: (datetime: Date | null) => void;
  selectedTime: Date | null;
}

export const SchedulingTimePicker: React.FC<SchedulingTimePickerProps> = ({
  onTimeSelect,
  selectedTime,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  // Fetch available slots for the selected date
  const { data, isLoading, error } = useQuery({
    queryKey: ['available-slots', selectedDate],
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/scheduling/available-slots?date=${selectedDate}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch available slots');
      }
      return response.json();
    },
    enabled: !!selectedDate,
  });

  // Get min and max dates for date picker
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const max = new Date();
    max.setDate(max.getDate() + 7);
    return max.toISOString().split('T')[0];
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
    onTimeSelect(null); // Reset time selection when date changes
  };

  const handleTimeSelect = (slot: TimeSlot) => {
    if (!slot.available) return;
    onTimeSelect(new Date(slot.datetime));
  };

  const handleASAPSelect = () => {
    onTimeSelect(null);
  };

  const isSlotSelected = (slot: TimeSlot) => {
    if (!selectedTime) return false;
    return new Date(slot.datetime).getTime() === selectedTime.getTime();
  };

  const isASAPSelected = selectedTime === null;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">When do you want your order?</h3>
        <p className="text-sm text-gray-600 mb-4">
          Schedule up to 7 days in advance, or choose ASAP for pickup in 15-20 minutes
        </p>
      </div>

      {/* ASAP Option */}
      <button
        onClick={handleASAPSelect}
        className={`
          w-full p-4 rounded-lg border-2 transition-all
          ${isASAPSelected
            ? 'border-blue-500 bg-blue-50 text-blue-700'
            : 'border-gray-300 hover:border-blue-300 bg-white'
          }
        `}
      >
        <div className="flex items-center justify-between">
          <div className="text-left">
            <div className="font-semibold">ASAP</div>
            <div className="text-sm text-gray-600">Ready in 15-20 minutes</div>
          </div>
          {isASAPSelected && (
            <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">or schedule for later</span>
        </div>
      </div>

      {/* Date Picker */}
      <div>
        <label htmlFor="date-picker" className="block text-sm font-medium text-gray-700 mb-2">
          Select Date
        </label>
        <input
          id="date-picker"
          type="date"
          min={getMinDate()}
          max={getMaxDate()}
          value={selectedDate}
          onChange={handleDateChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Time Slot Grid */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Time
        </label>

        {isLoading && (
          <div className="text-center py-8 text-gray-500">
            Loading available times...
          </div>
        )}

        {error && (
          <div className="text-center py-8 text-red-500">
            Failed to load available times. Please try again.
          </div>
        )}

        {!isLoading && !error && data?.slots?.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No available time slots for this date.
          </div>
        )}

        {!isLoading && !error && data?.slots && data.slots.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3">
            {data.slots.map((slot: TimeSlot) => (
              <button
                key={slot.time}
                onClick={() => handleTimeSelect(slot)}
                disabled={!slot.available}
                className={`
                  p-3 rounded-lg border transition-all text-center
                  ${!slot.available
                    ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                    : isSlotSelected(slot)
                    ? 'border-blue-500 bg-blue-50 text-blue-700 border-2'
                    : 'border-gray-300 hover:border-blue-300 bg-white hover:bg-blue-50'
                  }
                `}
              >
                <div className="font-medium text-sm">{slot.time}</div>
                <div className="text-xs mt-1">
                  {slot.available ? (
                    <span className="text-green-600">
                      {slot.maxOrders - slot.ordersCount} spots
                    </span>
                  ) : (
                    <span className="text-gray-400">Full</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected Time Display */}
      {selectedTime && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <div>
              <div className="font-semibold text-blue-900">Scheduled Pickup</div>
              <div className="text-sm text-blue-700">
                {selectedTime.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
                {' at '}
                {selectedTime.toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                })}
              </div>
              <div className="text-xs text-blue-600 mt-1">
                You'll receive a reminder 15 minutes before your pickup time
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
