import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/Common/Toast';
import { formatDate } from '@/utils/formatters';
import { Plus, Search, Bus, MapPin, Clock, Users, Route, AlertTriangle } from 'lucide-react';

interface BusRoute {
  id: string;
  routeName: string;
  routeNumber: string;
  startLocation: string;
  endLocation: string;
  stops: string[];
  departureTime: string;
  estimatedDuration: number;
  status: 'active' | 'inactive' | 'maintenance';
  driverId: string;
  vehicleId: string;
  studentCount: number;
}

interface Vehicle {
  id: string;
  vehicleNumber: string;
  type: 'bus' | 'van' | 'car';
  capacity: number;
  status: 'available' | 'in-use' | 'maintenance' | 'out-of-service';
  driverId: string;
  lastMaintenance: string;
  nextMaintenance: string;
  fuelType: string;
  mileage: number;
}

interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  phone: string;
  experience: number;
  status: 'active' | 'inactive' | 'on-leave';
  assignedVehicle?: string;
}

export default function Transportation() {
  const { addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('routes');

  // Mock data
  const routes: BusRoute[] = [
    {
      id: '1',
      routeName: 'City Center Route',
      routeNumber: 'R001',
      startLocation: 'School Campus',
      endLocation: 'City Center',
      stops: ['Main Street', 'Central Park', 'Shopping Mall', 'City Center'],
      departureTime: '07:30',
      estimatedDuration: 45,
      status: 'active',
      driverId: '1',
      vehicleId: '1',
      studentCount: 35
    },
    {
      id: '2',
      routeName: 'Suburban Route',
      routeNumber: 'R002',
      startLocation: 'School Campus',
      endLocation: 'Suburbs',
      stops: ['Oak Avenue', 'Pine Street', 'Maple Road', 'Suburbs'],
      departureTime: '08:00',
      estimatedDuration: 60,
      status: 'active',
      driverId: '2',
      vehicleId: '2',
      studentCount: 28
    }
  ];

  const vehicles: Vehicle[] = [
    {
      id: '1',
      vehicleNumber: 'BUS-001',
      type: 'bus',
      capacity: 40,
      status: 'in-use',
      driverId: '1',
      lastMaintenance: '2024-01-15',
      nextMaintenance: '2024-04-15',
      fuelType: 'Diesel',
      mileage: 85000
    },
    {
      id: '2',
      vehicleNumber: 'BUS-002',
      type: 'bus',
      capacity: 35,
      status: 'in-use',
      driverId: '2',
      lastMaintenance: '2024-02-01',
      nextMaintenance: '2024-05-01',
      fuelType: 'Diesel',
      mileage: 72000
    }
  ];

  const drivers: Driver[] = [
    {
      id: '1',
      name: 'Robert Wilson',
      licenseNumber: 'DL123456789',
      phone: '+1 (555) 123-4567',
      experience: 8,
      status: 'active',
      assignedVehicle: '1'
    },
    {
      id: '2',
      name: 'Maria Garcia',
      licenseNumber: 'DL987654321',
      phone: '+1 (555) 987-6543',
      experience: 12,
      status: 'active',
      assignedVehicle: '2'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'available':
      case 'in-use':
        return 'bg-green-100 text-green-800';
      case 'inactive':
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'out-of-service':
      case 'on-leave':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDriverName = (driverId: string) => {
    const driver = drivers.find(d => d.id === driverId);
    return driver ? driver.name : 'Unassigned';
  };

  const stats = {
    totalRoutes: routes.length,
    activeRoutes: routes.filter(r => r.status === 'active').length,
    totalVehicles: vehicles.length,
    availableVehicles: vehicles.filter(v => v.status === 'available').length,
    totalStudents: routes.reduce((sum, route) => sum + route.studentCount, 0),
    activeDrivers: drivers.filter(d => d.status === 'active').length
  };

  const handleAddRoute = () => {
    addToast('Route creation feature coming soon!', 'info');
  };

  const handleAddVehicle = () => {
    addToast('Vehicle addition feature coming soon!', 'info');
  };

  const handleTrackVehicle = () => {
    addToast('Live vehicle tracking feature coming soon!', 'info');
  };

  return (
    <div className="space-y-8" data-testid="transportation-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2" data-testid="text-page-title">
            Transportation Management
          </h2>
          <p className="text-slate-600" data-testid="text-page-subtitle">
            Manage school transportation, routes, and vehicles
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleAddRoute} data-testid="button-add-route">
            <Plus className="w-4 h-4 mr-2" />
            Add Route
          </Button>
          <Button onClick={handleTrackVehicle} data-testid="button-track-vehicles">
            <MapPin className="w-4 h-4 mr-2" />
            Track Vehicles
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Routes</p>
                <p className="text-3xl font-bold text-slate-800">{stats.totalRoutes}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Route className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Active Routes</p>
                <p className="text-3xl font-bold text-slate-800">{stats.activeRoutes}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Route className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Vehicles</p>
                <p className="text-3xl font-bold text-slate-800">{stats.totalVehicles}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Bus className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Available</p>
                <p className="text-3xl font-bold text-slate-800">{stats.availableVehicles}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Bus className="w-6 h-6 text-yellow-600" />
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
                <p className="text-sm font-medium text-slate-600">Drivers</p>
                <p className="text-3xl font-bold text-slate-800">{stats.activeDrivers}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-red-600" />
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
              variant={activeTab === 'routes' ? 'default' : 'outline'}
              onClick={() => setActiveTab('routes')}
              data-testid="tab-routes"
            >
              Routes
            </Button>
            <Button
              variant={activeTab === 'vehicles' ? 'default' : 'outline'}
              onClick={() => setActiveTab('vehicles')}
              data-testid="tab-vehicles"
            >
              Vehicles
            </Button>
            <Button
              variant={activeTab === 'drivers' ? 'default' : 'outline'}
              onClick={() => setActiveTab('drivers')}
              data-testid="tab-drivers"
            >
              Drivers
            </Button>
            <Button
              variant={activeTab === 'tracking' ? 'default' : 'outline'}
              onClick={() => setActiveTab('tracking')}
              data-testid="tab-tracking"
            >
              Live Tracking
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Search and Filters */}
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
                data-testid="input-search-transportation"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48" data-testid="select-status-filter">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Routes Tab */}
      {activeTab === 'routes' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {routes.map((route) => (
            <Card key={route.id} className="hover:shadow-md transition-shadow" data-testid={`card-route-${route.id}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-1" data-testid={`text-route-name-${route.id}`}>
                      {route.routeName}
                    </h3>
                    <p className="text-sm text-slate-600" data-testid={`text-route-number-${route.id}`}>
                      Route {route.routeNumber}
                    </p>
                  </div>
                  <Badge className={getStatusColor(route.status)}>
                    {route.status}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600" data-testid={`text-route-path-${route.id}`}>
                      {route.startLocation} → {route.endLocation}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600" data-testid={`text-route-time-${route.id}`}>
                      Departure: {route.departureTime} ({route.estimatedDuration} min)
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600" data-testid={`text-route-students-${route.id}`}>
                      {route.studentCount} students
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <Bus className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600" data-testid={`text-route-driver-${route.id}`}>
                      Driver: {getDriverName(route.driverId)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-200">
                  <p className="text-sm font-medium text-slate-700 mb-2">Stops:</p>
                  <div className="flex flex-wrap gap-1">
                    {route.stops.map((stop, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {stop}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1" data-testid={`button-edit-route-${route.id}`}>
                    Edit Route
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" data-testid={`button-track-route-${route.id}`}>
                    Track
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Vehicles Tab */}
      {activeTab === 'vehicles' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Vehicle Fleet</CardTitle>
              <Button onClick={handleAddVehicle} data-testid="button-add-vehicle">
                <Plus className="w-4 h-4 mr-2" />
                Add Vehicle
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Vehicle</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Type</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Capacity</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Driver</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Next Maintenance</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {vehicles.map((vehicle) => (
                    <tr key={vehicle.id} className="hover:bg-slate-50" data-testid={`row-vehicle-${vehicle.id}`}>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-slate-800" data-testid={`text-vehicle-number-${vehicle.id}`}>
                            {vehicle.vehicleNumber}
                          </p>
                          <p className="text-sm text-slate-600">
                            {vehicle.fuelType} • {vehicle.mileage.toLocaleString()} miles
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600" data-testid={`text-vehicle-type-${vehicle.id}`}>
                        {vehicle.type.toUpperCase()}
                      </td>
                      <td className="px-4 py-3 text-slate-600" data-testid={`text-vehicle-capacity-${vehicle.id}`}>
                        {vehicle.capacity}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={getStatusColor(vehicle.status)}>
                          {vehicle.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-600" data-testid={`text-vehicle-driver-${vehicle.id}`}>
                        {getDriverName(vehicle.driverId)}
                      </td>
                      <td className="px-4 py-3 text-slate-600" data-testid={`text-vehicle-maintenance-${vehicle.id}`}>
                        {formatDate(vehicle.nextMaintenance)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" data-testid={`button-edit-vehicle-${vehicle.id}`}>
                            Edit
                          </Button>
                          <Button variant="outline" size="sm" data-testid={`button-maintain-vehicle-${vehicle.id}`}>
                            Maintain
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Drivers Tab */}
      {activeTab === 'drivers' && (
        <Card>
          <CardHeader>
            <CardTitle>Driver Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {drivers.map((driver) => (
                <Card key={driver.id} className="hover:shadow-md transition-shadow" data-testid={`card-driver-${driver.id}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-slate-800" data-testid={`text-driver-name-${driver.id}`}>
                          {driver.name}
                        </h3>
                        <p className="text-sm text-slate-600" data-testid={`text-driver-license-${driver.id}`}>
                          License: {driver.licenseNumber}
                        </p>
                      </div>
                      <Badge className={getStatusColor(driver.status)}>
                        {driver.status}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Phone:</span>
                        <span className="text-slate-800" data-testid={`text-driver-phone-${driver.id}`}>
                          {driver.phone}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Experience:</span>
                        <span className="text-slate-800" data-testid={`text-driver-experience-${driver.id}`}>
                          {driver.experience} years
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Assigned Vehicle:</span>
                        <span className="text-slate-800" data-testid={`text-driver-vehicle-${driver.id}`}>
                          {driver.assignedVehicle ? 
                            vehicles.find(v => v.id === driver.assignedVehicle)?.vehicleNumber || 'Unknown' : 
                            'None'
                          }
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1" data-testid={`button-edit-driver-${driver.id}`}>
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1" data-testid={`button-assign-driver-${driver.id}`}>
                        Assign
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Live Tracking Tab */}
      {activeTab === 'tracking' && (
        <Card>
          <CardHeader>
            <CardTitle>Live Vehicle Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-slate-500">
              <MapPin className="w-12 h-12 mx-auto mb-4 text-slate-400" />
              <p>Live GPS tracking feature coming soon!</p>
              <p className="text-sm mt-2">Track real-time location of all school vehicles</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
