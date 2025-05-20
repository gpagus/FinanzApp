import {useState} from 'react';
import {HelpCircle, X, ChevronRight} from 'lucide-react';
import Boton from "./Boton";

const InfoTooltip = ({
                         tooltipText,
                         detailTitle,
                         detailContent,
                         position = 'right'
                     }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const [showDetail, setShowDetail] = useState(false);

    // Configuraciones de posición del tooltip
    const positionClasses = {
        top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
        right: 'left-full top-0 ml-2',
        bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
        left: 'right-full top-0 mr-2'
    };

    return (
        <div className="relative inline-block">
            {/* Icono de ayuda */}
            <div
                className="inline-flex cursor-help"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onClick={() => setShowDetail(true)}
            >
                <HelpCircle className="text-aguazul w-5 h-5 hover:opacity-80 transition-opacity"/>
            </div>

            {/* Tooltip básico mejorado */}
            {showTooltip && !showDetail && (
                <div
                    className={`absolute z-10 ${positionClasses[position]} bg-aguazul text-white text-sm rounded p-2 w-64 shadow-lg`}>
                    <div className="flex items-start justify-between">
                        <div>{tooltipText}</div>
                        {/*<div className="ml-2 flex items-center text-xs border-l pl-2 border-white/30">
                            <span>Más info</span>
                            <ChevronRight className="w-3 h-3 ml-1" />
                        </div>*/}
                    </div>
                    <div className="mt-1 text-xs text-white/70 italic">Haz clic para más detalles</div>
                </div>
            )}

            {/* Modal detallado */}
            {showDetail && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
                        <div className="flex justify-between items-center p-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-aguazul">{detailTitle}</h3>
                            <Boton
                                tipo="icono"
                                onClick={() => setShowDetail(false)}
                            >
                                <X className="w-5 h-5"/>
                            </Boton>
                        </div>
                        <div className="p-6">
                            {Array.isArray(detailContent) ? (
                                detailContent.map((item, index) => (
                                    <div key={index} className="mb-4">
                                        <h4 className="font-semibold text-gray-800 mb-1">{item.title}</h4>
                                        <p className="text-gray-600">{item.description}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-600">{detailContent}</p>
                            )}
                        </div>
                        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                            <Boton
                                tipo="primario"
                                onClick={() => setShowDetail(false)}
                            >
                                Entendido
                            </Boton>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default InfoTooltip;