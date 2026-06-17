import React from 'react';

const About = () => {
    return (
        <div className="container mt-5">
            <div className="row">
                <div className="col-md-8 mx-auto text-center">
                    <h1>Về chúng tôi</h1>
                    <p className="lead mt-4">
                        Minimal Decor là thương hiệu chuyên cung cấp các sản phẩm nội thất và đồ trang trí 
                        theo phong cách tối giản, hiện đại.
                    </p>
                    <p>
                        Chúng tôi tin rằng vẻ đẹp đến từ sự đơn giản và tinh tế. Mỗi sản phẩm của Minimal Decor 
                        đều được lựa chọn cẩn thận, từ chất liệu đến kiểu dáng, để mang lại không gian sống 
                        hài hòa và thư giãn cho ngôi nhà của bạn.
                    </p>
                    <hr className="my-4" />
                    <h3>Sứ mệnh của chúng tôi</h3>
                    <p>
                        Mang đến những giải pháp trang trí nội thất tối giản nhưng đầy đủ công năng, 
                        giúp khách hàng tạo nên không gian sống đẹp và thoải mái.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default About;