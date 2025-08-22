import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/Common/Toast';
import { formatDate } from '@/utils/formatters';
import { Plus, Search, Building, Wrench, Calendar, MapPin, AlertTriangle, CheckCircle } from 'lucide-react';

interface Facility {
  id: string;
  name: string;
  type: string;
  location: string;
  capacity: number;
  status: 'available' | 'occupied' | 'maintenance' | 'unavailable';
  description: string;
  lastMaintenance: string;
  nextMaintenance: string;
}

interface MaintenanceRequest {
  id: string;
  facilityId: string;
  facilityName: string;
  type: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  description: string;
  requestedBy: string;
  requestDate: string;
  completedDate?: string;
}

export default function Facilities() {
  const { addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('facilities');

  // Mock data
  const facilities: Facility[] = [
    {
      id: '1',
      name: 'Science Laboratory A',
      type: 'laboratory',
      location: 'Building A, Floor 2',
      capacity: 30,
      status: 'available',
      description: 'Fully equipped chemistry and physics laboratory',
      lastMaintenance: '2024-01-15',
      nextMaintenance: '2024-04-15'
    },
    {
      id: '2',
      name: 'Main Auditorium',
      type: 'auditorium',
      location: 'Building B, Ground Floor',
      capacity: 500,
      status: 'occupied',
      description: 'Large auditorium with stage and audio-visual equipment',
      lastMaintenance: '2024-01-01',
      nextMaintenance: '2024-03-01'
    },
    {
      id: '3',
      name: 'Computer Lab 1',
      type: 'computer-lab',
      location: 'Building C, Floor 1',
      capacity: 40,
      status: 'maintenance',
      description: 'Computer laboratory with 40 workstations',
      lastMaintenance: '2024-02-01',
      nextMaintenance: '2024-05-01'
    }
  ];

  const maintenanceRequests: MaintenanceRequest[] = [
    {
      id: '1',
      facilityId: '3',
      facilityName: 'Computer Lab 1',
      type: 'Repair',
      priority: 'high',
      status: 'in-progress',
      description: 'Air conditioning system malfunction',
      requestedBy: 'John Smith',
      requestDate: '2024-02-10'
    },
    {
      id: '2',
      facilityId: '1',
      facilityName: 'Science Laboratory A',
      type: 'Maintenance',
      priority: 'medium',
      status: 'pending',
      description: 'Routine equipment calibration needed',
      requestedBy: 'Jane Doe',
      requestDate: '2024-02-12'
    }
  ];

  const filteredFacilities = facilities.filter(facility => {
    const matchesSearch = 
      facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      facility.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || facility.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || facility.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const filteredMaintenanceRequests = maintenanceRequests.filter(request => {
    const matchesSearch = 
      request.facilityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'occupied':
        return 'bg-blue-100 text-blue-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'unavailable':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMaintenanceStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    totalFacilities: facilities.length,
    availableFacilities: facilities.filter(f => f.status === 'available').length,
    underMaintenance: facilities.filter(f => f.status === 'maintenance').length,
    pendingRequests: maintenanceRequests.filter(r => r.status === 'pending').length
  };

  const handleAddFacility = () => {
    addToast('Facility addition feature coming soon!', 'info');
  };

  const handleMaintenanceRequest = () => {
    addToast('Maintenance request feature coming soon!', 'info');
  };

  const facilityTypes = ['laboratory', 'auditorium', 'computer-lab', 'classroom', 'library', 'sports', 'cafeteria'];

  return (
    <div className="space-y-8" data-testid="facilities-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2" data-testid="text-page-title">
            Facilities Management
          </h2>
          <p className="text-slate-600" data-testid="text-page-subtitle">
            Manage school facilities, bookings, and maintenance
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleAddFacility} data-testid="button-add-facility">
            <Plus className="w-4 h-4 mr-2" />
            Add Facility
          </Button>
          <Button onClick={handleMaintenanceRequest} data-testid="button-maintenance-request">
            <Wrench className="w-4 h-4 mr-2" />
            Maintenance Request
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Facilities</p>
                <p className="text-3xl font-bold text-slate-800">{stats.totalFacilities}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Available</p>
                <p className="text-3xl font-bold text-slate-800">{stats.availableFacilities}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Under Maintenance</p>
                <p className="text-3xl font-bold text-slate-800">{stats.underMaintenance}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Wrench className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Pending Requests</p>
                <p className="text-3xl font-bold text-slate-800">{stats.pendingRequests}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
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
              variant={activeTab === 'facilities' ? 'default' : 'outline'}
              onClick={() => setActiveTab('facilities')}
              data-testid="tab-facilities"
            >
              Facilities
            </Button>
            <Button
              variant={activeTab === 'bookings' ? 'default' : 'outline'}
              onClick={() => setActiveTab('bookings')}
              data-testid="tab-bookings"
            >
              Room Bookings
            </Button>
            <Button
              variant={activeTab === 'maintenance' ? 'default' : 'outline'}
              onClick={() => setActiveTab('maintenance')}
              data-testid="tab-maintenance"
            >
              Maintenance
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
                placeholder="Search facilities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-facilities"
              />
            </div>
            
            {activeTab === 'facilities' && (
              <>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full md:w-48" data-testid="select-type-filter">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {facilityTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                      </SelectItem>
                    ))}
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
                    <SelectItem value="unavailable">Unavailable</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Facilities Grid */}
      {activeTab === 'facilities' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFacilities.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="p-8 text-center">
                <Building className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-500" data-testid="text-no-facilities">
                  No facilities found matching your criteria.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredFacilities.map((facility) => (
              <Card key={facility.id} className="hover:shadow-md transition-shadow" data-testid={`card-facility-${facility.id}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-1" data-testid={`text-facility-name-${facility.id}`}>
                        {facility.name}
                      </h3>
                      <p className="text-sm text-slate-600" data-testid={`text-facility-type-${facility.id}`}>
                        {facility.type.replace('-', ' ').toUpperCase()}
                      </p>
                    </div>
                    <Badge className={getStatusColor(facility.status)}>
                      {facility.status}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600" data-testid={`text-facility-location-${facility.id}`}>
                        {facility.location}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600" data-testid={`text-facility-capacity-${facility.id}`}>
                        Capacity: {facility.capacity}
                      </span>
                    </div>
                    
                    <p className="text-sm text-slate-600" data-testid={`text-facility-description-${facility.id}`}>
                      {facility.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Last Maintenance: {formatDate(facility.lastMaintenance)}</span>
                    </div>
                    <div className="mt-1">
                      <span className="text-xs text-slate-500">Next: {formatDate(facility.nextMaintenance)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1" data-testid={`button-book-facility-${facility.id}`}>
                      Book
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" data-testid={`button-view-facility-${facility.id}`}>
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Room Bookings */}
      {activeTab === 'bookings' && (
        <Card>
          <CardHeader>
            <CardTitle>Room Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-slate-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-slate-400" />
              <p>Room booking system coming soon!</p>
              <p className="text-sm mt-2">Manage facility reservations and schedules</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Maintenance Requests */}
      {activeTab === 'maintenance' && (
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Facility</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Type</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Priority</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Requested By</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Date</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredMaintenanceRequests.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-500">
                        No maintenance requests found.
                      </td>
                    </tr>
                  ) : (
                    filteredMaintenanceRequests.map((request) => (
                      <tr key={request.id} className="hover:bg-slate-50" data-testid={`row-maintenance-${request.id}`}>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-slate-800" data-testid={`text-request-facility-${request.id}`}>
                              {request.facilityName}
                            </p>
                            <p className="text-sm text-slate-600" data-testid={`text-request-description-${request.id}`}>
                              {request.description}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600" data-testid={`text-request-type-${request.id}`}>
                          {request.type}
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={getPriorityColor(request.priority)}>
                            {request.priority}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={getMaintenanceStatusColor(request.status)}>
                            {request.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-slate-600" data-testid={`text-request-by-${request.id}`}>
                          {request.requestedBy}
                        </td>
                        <td className="px-4 py-3 text-slate-600" data-testid={`text-request-date-${request.id}`}>
                          {formatDate(request.requestDate)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm" data-testid={`button-view-request-${request.id}`}>
                              View
                            </Button>
                            {request.status === 'pending' && (
                              <Button size="sm" data-testid={`button-assign-request-${request.id}`}>
                                Assign
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
