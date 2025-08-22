import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/Common/Toast';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Plus, Search, Bed, Users, Home, Utensils, AlertCircle, Clock } from 'lucide-react';

interface Room {
  id: string;
  roomNumber: string;
  type: 'single' | 'double' | 'triple' | 'dormitory';
  capacity: number;
  occupied: number;
  floor: number;
  building: string;
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  facilities: string[];
  monthlyRent: number;
}

interface HostelStudent {
  id: string;
  studentId: string;
  studentName: string;
  roomId: string;
  roomNumber: string;
  admissionDate: string;
  checkInDate: string;
  checkOutDate?: string;
  status: 'active' | 'checkout' | 'suspended';
  guardianContact: string;
  emergencyContact: string;
  monthlyFee: number;
  lastPayment: string;
  avatar?: string;
}

interface MessMenu {
  day: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  snacks: string;
}

export default function Hostel() {
  const { addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roomTypeFilter, setRoomTypeFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('rooms');

  // Mock data
  const rooms: Room[] = [
    {
      id: '1',
      roomNumber: 'A101',
      type: 'double',
      capacity: 2,
      occupied: 2,
      floor: 1,
      building: 'Block A',
      status: 'occupied',
      facilities: ['AC', 'Attached Bathroom', 'Study Table', 'Wardrobe'],
      monthlyRent: 800
    },
    {
      id: '2',
      roomNumber: 'A102',
      type: 'double',
      capacity: 2,
      occupied: 1,
      floor: 1,
      building: 'Block A',
      status: 'available',
      facilities: ['AC', 'Attached Bathroom', 'Study Table', 'Wardrobe'],
      monthlyRent: 800
    },
    {
      id: '3',
      roomNumber: 'B201',
      type: 'triple',
      capacity: 3,
      occupied: 0,
      floor: 2,
      building: 'Block B',
      status: 'maintenance',
      facilities: ['Fan', 'Common Bathroom', 'Study Table', 'Wardrobe'],
      monthlyRent: 600
    }
  ];

  const hostelStudents: HostelStudent[] = [
    {
      id: '1',
      studentId: 'STU001',
      studentName: 'Alex Johnson',
      roomId: '1',
      roomNumber: 'A101',
      admissionDate: '2024-01-15',
      checkInDate: '2024-01-15',
      status: 'active',
      guardianContact: '+1 (555) 123-4567',
      emergencyContact: '+1 (555) 987-6543',
      monthlyFee: 800,
      lastPayment: '2024-02-01',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100'
    },
    {
      id: '2',
      studentId: 'STU002',
      studentName: 'Sarah Davis',
      roomId: '1',
      roomNumber: 'A101',
      admissionDate: '2024-01-20',
      checkInDate: '2024-01-20',
      status: 'active',
      guardianContact: '+1 (555) 234-5678',
      emergencyContact: '+1 (555) 876-5432',
      monthlyFee: 800,
      lastPayment: '2024-02-01',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100'
    }
  ];

  const messMenu: MessMenu[] = [
    {
      day: 'Monday',
      breakfast: 'Oatmeal, Toast, Orange Juice',
      lunch: 'Rice, Dal, Vegetable Curry, Roti',
      dinner: 'Pasta, Garlic Bread, Salad',
      snacks: 'Tea, Biscuits'
    },
    {
      day: 'Tuesday',
      breakfast: 'Pancakes, Syrup, Milk',
      lunch: 'Biryani, Raita, Pickle',
      dinner: 'Chicken Curry, Rice, Naan',
      snacks: 'Coffee, Samosa'
    }
  ];

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.building.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || room.status === statusFilter;
    const matchesType = roomTypeFilter === 'all' || room.type === roomTypeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const filteredStudents = hostelStudents.filter(student => {
    const matchesSearch = 
      student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'occupied':
        return 'bg-blue-100 text-blue-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'reserved':
        return 'bg-purple-100 text-purple-800';
      case 'checkout':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    totalRooms: rooms.length,
    occupiedRooms: rooms.filter(r => r.status === 'occupied').length,
    availableRooms: rooms.filter(r => r.status === 'available').length,
    totalStudents: hostelStudents.length,
    activeStudents: hostelStudents.filter(s => s.status === 'active').length,
    totalRevenue: hostelStudents.reduce((sum, s) => sum + s.monthlyFee, 0),
    occupancyRate: Math.round((rooms.filter(r => r.status === 'occupied').length / rooms.length) * 100)
  };

  const handleRoomAllocation = () => {
    addToast('Room allocation feature coming soon!', 'info');
  };

  const handleCheckIn = () => {
    addToast('Student check-in feature coming soon!', 'info');
  };

  const handleCheckOut = () => {
    addToast('Student check-out feature coming soon!', 'info');
  };

  return (
    <div className="space-y-8" data-testid="hostel-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2" data-testid="text-page-title">
            Hostel Management
          </h2>
          <p className="text-slate-600" data-testid="text-page-subtitle">
            Manage hostel accommodations, room allocations, and student services
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleRoomAllocation} data-testid="button-allocate-room">
            <Plus className="w-4 h-4 mr-2" />
            Allocate Room
          </Button>
          <Button onClick={handleCheckIn} data-testid="button-check-in">
            <Home className="w-4 h-4 mr-2" />
            Check In
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Rooms</p>
                <p className="text-3xl font-bold text-slate-800">{stats.totalRooms}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Bed className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Occupied</p>
                <p className="text-3xl font-bold text-slate-800">{stats.occupiedRooms}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Available</p>
                <p className="text-3xl font-bold text-slate-800">{stats.availableRooms}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Bed className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Students</p>
                <p className="text-3xl font-bold text-slate-800">{stats.totalStudents}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Active</p>
                <p className="text-3xl font-bold text-slate-800">{stats.activeStudents}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Revenue</p>
                <p className="text-3xl font-bold text-slate-800">{formatCurrency(stats.totalRevenue)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Occupancy</p>
                <p className="text-3xl font-bold text-slate-800">{stats.occupancyRate}%</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Card>
        <CardHeader>
          <div className="flex space-x-4">
            <Button
              variant={activeTab === 'rooms' ? 'default' : 'outline'}
              onClick={() => setActiveTab('rooms')}
              data-testid="tab-rooms"
            >
              Room Management
            </Button>
            <Button
              variant={activeTab === 'students' ? 'default' : 'outline'}
              onClick={() => setActiveTab('students')}
              data-testid="tab-students"
            >
              Hostel Students
            </Button>
            <Button
              variant={activeTab === 'mess' ? 'default' : 'outline'}
              onClick={() => setActiveTab('mess')}
              data-testid="tab-mess"
            >
              Mess Management
            </Button>
            <Button
              variant={activeTab === 'facilities' ? 'default' : 'outline'}
              onClick={() => setActiveTab('facilities')}
              data-testid="tab-facilities"
            >
              Facilities
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-hostel"
              />
            </div>
            
            {activeTab === 'rooms' && (
              <>
                <Select value={roomTypeFilter} onValueChange={setRoomTypeFilter}>
                  <SelectTrigger className="w-full md:w-48" data-testid="select-room-type-filter">
                    <SelectValue placeholder="All Room Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Room Types</SelectItem>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="double">Double</SelectItem>
                    <SelectItem value="triple">Triple</SelectItem>
                    <SelectItem value="dormitory">Dormitory</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48" data-testid="select-status-filter">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="reserved">Reserved</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}

            {activeTab === 'students' && (
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48" data-testid="select-student-status-filter">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="checkout">Checked Out</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Room Management */}
      {activeTab === 'rooms' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="p-8 text-center">
                <Bed className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-500" data-testid="text-no-rooms">
                  No rooms found matching your criteria.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredRooms.map((room) => (
              <Card key={room.id} className="hover:shadow-md transition-shadow" data-testid={`card-room-${room.id}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-1" data-testid={`text-room-number-${room.id}`}>
                        Room {room.roomNumber}
                      </h3>
                      <p className="text-sm text-slate-600" data-testid={`text-room-building-${room.id}`}>
                        {room.building}, Floor {room.floor}
                      </p>
                    </div>
                    <Badge className={getStatusColor(room.status)}>
                      {room.status}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Type:</span>
                      <span className="font-medium text-slate-800" data-testid={`text-room-type-${room.id}`}>
                        {room.type.charAt(0).toUpperCase() + room.type.slice(1)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Occupancy:</span>
                      <span className="font-medium text-slate-800" data-testid={`text-room-occupancy-${room.id}`}>
                        {room.occupied}/{room.capacity}
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Monthly Rent:</span>
                      <span className="font-medium text-slate-800" data-testid={`text-room-rent-${room.id}`}>
                        {formatCurrency(room.monthlyRent)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <p className="text-sm font-medium text-slate-700 mb-2">Facilities:</p>
                    <div className="flex flex-wrap gap-1">
                      {room.facilities.map((facility, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {facility}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1" data-testid={`button-view-room-${room.id}`}>
                      View Details
                    </Button>
                    {room.status === 'available' && (
                      <Button size="sm" className="flex-1" data-testid={`button-allocate-room-${room.id}`}>
                        Allocate
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Hostel Students */}
      {activeTab === 'students' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="p-8 text-center">
                <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-500" data-testid="text-no-students">
                  No hostel students found.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredStudents.map((student) => (
              <Card key={student.id} className="hover:shadow-md transition-shadow" data-testid={`card-student-${student.id}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={student.avatar} alt={student.studentName} />
                        <AvatarFallback className="bg-primary-100 text-primary-700">
                          {student.studentName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-slate-800" data-testid={`text-student-name-${student.id}`}>
                          {student.studentName}
                        </h3>
                        <p className="text-sm text-slate-600" data-testid={`text-student-id-${student.id}`}>
                          ID: {student.studentId}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(student.status)}>
                      {student.status}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Room:</span>
                      <span className="font-medium text-slate-800" data-testid={`text-student-room-${student.id}`}>
                        {student.roomNumber}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-slate-600">Check-in:</span>
                      <span className="text-slate-800" data-testid={`text-student-checkin-${student.id}`}>
                        {formatDate(student.checkInDate)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-slate-600">Monthly Fee:</span>
                      <span className="font-medium text-slate-800" data-testid={`text-student-fee-${student.id}`}>
                        {formatCurrency(student.monthlyFee)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-slate-600">Last Payment:</span>
                      <span className="text-slate-800" data-testid={`text-student-payment-${student.id}`}>
                        {formatDate(student.lastPayment)}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1" data-testid={`button-view-student-${student.id}`}>
                      View Profile
                    </Button>
                    {student.status === 'active' && (
                      <Button variant="outline" size="sm" className="flex-1" onClick={handleCheckOut} data-testid={`button-checkout-student-${student.id}`}>
                        Check Out
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Mess Management */}
      {activeTab === 'mess' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Utensils className="w-5 h-5" />
                <span>Weekly Mess Menu</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-slate-200">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-slate-600">Day</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-600">Breakfast</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-600">Lunch</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-600">Dinner</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-600">Snacks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {messMenu.map((menu, index) => (
                      <tr key={menu.day} className="hover:bg-slate-50" data-testid={`row-menu-${index}`}>
                        <td className="px-4 py-3 font-medium text-slate-800" data-testid={`text-day-${index}`}>
                          {menu.day}
                        </td>
                        <td className="px-4 py-3 text-slate-600" data-testid={`text-breakfast-${index}`}>
                          {menu.breakfast}
                        </td>
                        <td className="px-4 py-3 text-slate-600" data-testid={`text-lunch-${index}`}>
                          {menu.lunch}
                        </td>
                        <td className="px-4 py-3 text-slate-600" data-testid={`text-dinner-${index}`}>
                          {menu.dinner}
                        </td>
                        <td className="px-4 py-3 text-slate-600" data-testid={`text-snacks-${index}`}>
                          {menu.snacks}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Utensils className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">Mess Subscription</h3>
                <p className="text-2xl font-bold text-slate-800 mb-1">78</p>
                <p className="text-sm text-slate-600">Active subscribers</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">Monthly Revenue</h3>
                <p className="text-2xl font-bold text-slate-800 mb-1">{formatCurrency(15600)}</p>
                <p className="text-sm text-slate-600">Mess fees collected</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">Pending Payments</h3>
                <p className="text-2xl font-bold text-slate-800 mb-1">12</p>
                <p className="text-sm text-slate-600">Students with dues</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Facilities */}
      {activeTab === 'facilities' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Utensils className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Dining Hall</h3>
              <p className="text-sm text-slate-600 mb-4">Common dining area with capacity for 150 students</p>
              <Badge className="bg-green-100 text-green-800">Operational</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Common Room</h3>
              <p className="text-sm text-slate-600 mb-4">Recreation area with TV, games, and seating</p>
              <Badge className="bg-green-100 text-green-800">Operational</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Bed className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Laundry Service</h3>
              <p className="text-sm text-slate-600 mb-4">Washing machines and drying facilities available</p>
              <Badge className="bg-green-100 text-green-800">Operational</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Study Hall</h3>
              <p className="text-sm text-slate-600 mb-4">Quiet study area with individual desks and WiFi</p>
              <Badge className="bg-green-100 text-green-800">Operational</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Home className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Security</h3>
              <p className="text-sm text-slate-600 mb-4">24/7 security with CCTV surveillance</p>
              <Badge className="bg-green-100 text-green-800">Operational</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Medical Room</h3>
              <p className="text-sm text-slate-600 mb-4">First aid and basic medical facilities</p>
              <Badge className="bg-green-100 text-green-800">Operational</Badge>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
