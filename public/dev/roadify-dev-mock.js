/**
 * Dev-only: sample incidents / cars / reports / images for dashboard UI testing (?mock=1).
 *
 * Cars: composite primary key (incidentId, slot). Slot 1 = car 1, slot 2 = car 2.
 * No separate primary key for car 2 — it is identified by the same incident FK + slot 2.
 *
 * To remove when you have real data:
 * 1. Delete the entire public/dev/ directory (this file included).
 * 2. In public/dashboard.html, remove the "DEV MOCK" block, the #mockBanner element,
 *    and the .mock-banner CSS rules (nothing else in the script references mock mode).
 */
(function () {
  var incidents = [
    {
      id: 'mock-001',
      createdAt: '2026-04-10T14:22:00.000Z',
      severity: 'High',
      status: 'Under review',
      location:
        'M1 Motorway northbound near exit 42, lane 2 — minor debris, vehicle stopped on shoulder',
    },
    {
      id: 'mock-002',
      createdAt: '2026-04-10T11:05:33.000Z',
      severity: 'Pending',
      status: 'Submitted',
      location: { lat: -33.8688, lng: 151.2093, label: 'CBD delivery zone' },
    },
    {
      id: 'mock-003',
      createdAt: '2026-04-09T09:15:00.000Z',
      severity: 'Low',
      status: 'Closed',
      location: 'Warehouse loading dock B, no injuries',
    },
    {
      id: 'mock-004',
      createdAt: '2026-04-08T16:40:12.000Z',
      severity: 'Medium',
      status: 'Submitted',
      location:
        'Very long address string for testing truncation: Industrial Estate Unit 7B, Rear Access via Service Road, Postcode 2000, Gate code required after 6pm',
    },
    {
      id: 'mock-005',
      createdAt: '2026-04-07T08:00:00.000Z',
      severity: 'Pending',
      status: 'Submitted',
      location: 'Fleet yard — pre-trip checklist only',
    },
  ];

  /**
   * PK = (incidentId, slot). References incidents.id. Car 2 is not a standalone key — same FK + slot 2.
   */
  var cars = [
    { incidentId: 'mock-001', slot: 1, vehicleRego: 'ABC123', driverName: 'Alex Morgan' },
    { incidentId: 'mock-001', slot: 2, vehicleRego: 'ZZZ999', driverName: 'Other driver' },
    { incidentId: 'mock-002', slot: 1, vehicleRego: 'XYZ789', driverName: 'Sam Taylor' },
    { incidentId: 'mock-002', slot: 2, vehicleRego: 'LMN000', driverName: 'Third party' },
    { incidentId: 'mock-003', slot: 1, vehicleRego: 'DEF456', driverName: 'Jordan Lee' },
    { incidentId: 'mock-003', slot: 2, vehicleRego: 'QQQ111', driverName: 'Parked vehicle owner' },
    { incidentId: 'mock-004', slot: 1, vehicleRego: 'GH12JK', driverName: 'Riley Chen' },
    { incidentId: 'mock-004', slot: 2, vehicleRego: 'RRR222', driverName: 'Merge lane vehicle' },
    { incidentId: 'mock-005', slot: 1, vehicleRego: 'LMN999', driverName: 'Fleet check' },
  ];

  /** Attached to incidents: each row references incidents.id via incidentId (FK). */
  var reports = [
    {
      id: 'rep-001',
      incidentId: 'mock-001',
      category: 'Insurance',
      summary: 'Photos attached; driver states stationary impact at roundabout.',
      createdAt: '2026-04-10T15:00:00.000Z',
      status: 'Sent',
    },
    {
      id: 'rep-002',
      incidentId: 'mock-002',
      category: 'Internal',
      summary: 'CBD delivery zone — review dashcam when uploaded.',
      createdAt: '2026-04-10T12:00:00.000Z',
      status: 'Draft',
    },
    {
      id: 'rep-003',
      incidentId: 'mock-003',
      category: 'Insurance',
      summary: 'Dock scrape; repaired in-house.',
      createdAt: '2026-04-09T10:00:00.000Z',
      status: 'Archived',
    },
  ];

  /** Matches upload-token / blob names from the driver flow */
  var images = [
    {
      id: 'img-001',
      incidentId: 'mock-001',
      fileName: 'incident-mock-001-a.jpg',
      kind: 'Scene',
      uploadedAt: '2026-04-10T14:25:00.000Z',
      note: 'Wide shot — northbound',
    },
    {
      id: 'img-002',
      incidentId: 'mock-001',
      fileName: 'incident-mock-001-b.jpg',
      kind: 'Damage',
      uploadedAt: '2026-04-10T14:26:00.000Z',
      note: 'Rear bumper close-up',
    },
    {
      id: 'img-003',
      incidentId: 'mock-002',
      fileName: 'incident-mock-002-a.jpg',
      kind: 'Rego',
      uploadedAt: '2026-04-10T11:10:00.000Z',
      note: 'Plate visibility check',
    },
  ];

  window.__ROADIFY_DEV_MOCK__ = {
    incidents: incidents,
    cars: cars,
    reports: reports,
    images: images,
    applyChrome: function (els) {
      els.mockBanner.hidden = false;
      els.mockBanner.textContent =
        'Sample incidents, cars (FK + slot PK), reports, and images (dev data). Remove ?mock=1 for the live API. You can delete public/dev/ when done.';
      els.autoCheckbox.disabled = true;
    },
  };
})();
