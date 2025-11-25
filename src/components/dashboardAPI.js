class dashboardAPI {
    constructor() {
      this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api/v1';
    }

    async DashboardList(nursestation, date) {
      try {
        const params = new URLSearchParams({
          nursestation: String(nursestation),
          ...(date ? { date: String(date) } : {}),
        });
        const url = `${this.baseURL}/dashboard/DashboardList?${params.toString()}`;
        console.log('DashboardList URL:', url);
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error fetching dashboard list:', error);
        throw error;
      }
    }

    async callQueue(roomId, called = 'N') {
      try {
        const params = new URLSearchParams({
          id: String(roomId),
          called: String(called)
        });
        const url = `${this.baseURL}/dashboard/callqueue?${params.toString()}`;
        console.log('CallQueue URL:', url);
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json().catch(() => ({}));
      } catch (error) {
        console.error('Error calling queue endpoint:', error);
        throw error;
      }
    }
}

export default new dashboardAPI();