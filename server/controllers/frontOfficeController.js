// controllers/frontOfficeController.js
import Enquiry from "../models/Enquiry.js";
import Visitor from "../models/Visitor.js";
import Complaint from "../models/Complaint.js";
import OnlineApplicant from "../models/OnlineApplicants.js";

// Get front office dashboard stats
export const getFrontOfficeStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Build date filter
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.enquiryDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate + 'T23:59:59.999Z')
      };
    }

    console.log("Date filter for enquiries:", dateFilter);
    
    // Get total counts
    const [
      totalEnquiries,
      totalVisitors,
      totalComplaints,
      totalApplications,
      pendingComplaints,
      resolvedComplaints
    ] = await Promise.all([
      Enquiry.countDocuments(dateFilter),
      Visitor.countDocuments(dateFilter),
      Complaint.countDocuments(dateFilter),
      OnlineApplicant.countDocuments(dateFilter),
      Complaint.countDocuments({ ...dateFilter, status: { $in: ['Open', 'In Progress'] } }),
      Complaint.countDocuments({ ...dateFilter, status: 'Resolved' })
    ]);

    // Debug: Get total count without date filter
    const totalEnquiriesAll = await Enquiry.countDocuments({});
    console.log("Total enquiries found (with filter):", totalEnquiries);
    console.log("Total enquiries found (all time):", totalEnquiriesAll);
    console.log("Total visitors found:", totalVisitors);
    console.log("Total complaints found:", totalComplaints);

    // Calculate conversion rate (enquiries to applications)
    const conversionRate = totalEnquiries > 0 ? ((totalApplications / totalEnquiries) * 100).toFixed(1) : 0;

    // Calculate average response time (mock calculation - you can implement real logic)
    const avgResponseTime = 24; // hours

    const stats = {
      totalEnquiries,
      totalVisitors,
      totalComplaints,
      totalApplications,
      conversionRate: parseFloat(conversionRate),
      avgResponseTime,
      pendingComplaints,
      resolvedComplaints
    };

    console.log("Front office stats:", stats);
    res.json({ data: stats });
  } catch (error) {
    console.error('Error fetching front office stats:', error);
    res.status(500).json({ 
      message: 'Error fetching front office stats', 
      error: error.message 
    });
  }
};

// Get enquiry conversion funnel data
export const getEnquiryConversionFunnel = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.enquiryDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate + 'T23:59:59.999Z')
      };
    }

    // Get enquiry status counts
    const statusCounts = await Enquiry.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const total = statusCounts.reduce((sum, item) => sum + item.count, 0);

    const conversionData = statusCounts.map(item => ({
      stage: item._id || 'Unknown',
      count: item.count,
      percentage: total > 0 ? ((item.count / total) * 100).toFixed(1) : 0
    }));

    res.json({ data: conversionData });
  } catch (error) {
    console.error('Error fetching enquiry conversion data:', error);
    res.status(500).json({ 
      message: 'Error fetching enquiry conversion data', 
      error: error.message 
    });
  }
};

// Get visitor reports data
export const getVisitorReports = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate + 'T23:59:59.999Z')
      };
    }

    // Get daily visitor counts
    const dailyData = await Visitor.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          visitors: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get daily enquiry counts (use enquiryDate for enquiries)
    const enquiryDateFilter = {};
    if (startDate && endDate) {
      enquiryDateFilter.enquiryDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate + 'T23:59:59.999Z')
      };
    }
    const dailyEnquiries = await Enquiry.aggregate([
      { $match: enquiryDateFilter },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$enquiryDate" }
          },
          enquiries: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Combine data
    const visitorReports = dailyData.map(item => {
      const enquiryData = dailyEnquiries.find(e => e._id === item._id);
      return {
        date: item._id,
        visitors: item.visitors,
        enquiries: enquiryData ? enquiryData.enquiries : 0,
        conversions: Math.floor(item.visitors * 0.1) // Mock conversion rate
      };
    });

    res.json({ data: visitorReports });
  } catch (error) {
    console.error('Error fetching visitor reports:', error);
    res.status(500).json({ 
      message: 'Error fetching visitor reports', 
      error: error.message 
    });
  }
};

// Get complaint SLA reports
export const getComplaintSLAReports = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate + 'T23:59:59.999Z')
      };
    }

    // Get complaint counts by category
    const categoryCounts = await Complaint.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const slaData = categoryCounts.map(item => {
      const total = item.count;
      const onTime = Math.floor(total * 0.8); // Mock 80% on-time rate
      const overdue = total - onTime;
      const slaPercentage = total > 0 ? ((onTime / total) * 100).toFixed(1) : 0;

      return {
        category: item._id || 'Other',
        total,
        onTime,
        overdue,
        slaPercentage: parseFloat(slaPercentage)
      };
    });

    res.json({ data: slaData });
  } catch (error) {
    console.error('Error fetching complaint SLA reports:', error);
    res.status(500).json({ 
      message: 'Error fetching complaint SLA reports', 
      error: error.message 
    });
  }
};

// Get application pipeline reports
export const getApplicationPipelineReports = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate + 'T23:59:59.999Z')
      };
    }

    // Get application status counts
    const statusCounts = await OnlineApplicant.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const total = statusCounts.reduce((sum, item) => sum + item.count, 0);

    const pipelineData = statusCounts.map(item => ({
      stage: item._id || 'Unknown',
      count: item.count,
      percentage: total > 0 ? ((item.count / total) * 100).toFixed(1) : 0,
      trend: 'stable' // Mock trend
    }));

    res.json({ data: pipelineData });
  } catch (error) {
    console.error('Error fetching application pipeline reports:', error);
    res.status(500).json({ 
      message: 'Error fetching application pipeline reports', 
      error: error.message 
    });
  }
};

// Export front office report
export const exportFrontOfficeReport = async (req, res) => {
  try {
    const { reportType } = req.params;
    const { startDate, endDate } = req.query;

    // This is a placeholder - you would implement actual Excel export logic here
    res.json({ 
      message: `Exporting ${reportType} report from ${startDate} to ${endDate}`,
      data: 'Report data would be here'
    });
  } catch (error) {
    console.error('Error exporting front office report:', error);
    res.status(500).json({ 
      message: 'Error exporting front office report', 
      error: error.message 
    });
  }
};
